import express from 'express'
import { posaljiGresku } from '../servisi/Poruke'
import TerminPoseteModel from '../models/TerminPosete'
import ZivotinjaModel from '../models/Zivotinja'
import AzilModel from '../models/Azil'
import { posaljiEmailOTerminu, posaljiEmailOOtkazivanjuKorisnika } from '../servisi/Mailer'
import { nepraznTekst } from '../servisi/Validacija'
import { izracunajSlobodneSlotove, jeTerminValidanISlobodan, azurirajIstekleTermine, azurirajStatusZivotinje, imaPreklapajuciTerminKorisnika } from '../servisi/TerminValidacija'

const AKTIVNI_STATUSI = ['na_cekanju', 'odobren', 'predlozen_novi']

export class TerminKontroler {

    slobodniSlotovi = async (req: express.Request, res: express.Response) => {

        try {
            const { azilId, datum } = req.query as { azilId: string, datum: string }

            const azil = await AzilModel.findById(azilId)

            if (azil == null) {
                posaljiGresku(res, 404, 'AZIL_NE_POSTOJI')
                return
            }

            const slotovi = await izracunajSlobodneSlotove(azil, datum)

            res.json(slotovi)

        } catch (err) {
            console.log(err)
            posaljiGresku(res, 500, 'GRESKA_SLOBODNI_TERMINI')
        }
    }

    zakaziTermin = async (req: express.Request, res: express.Response) => {

        try {
            const korisnik = (req as any).ulogovan
            const { zivotinjaId, datumVreme } = req.body

            const formular = korisnik.formular

            if (!nepraznTekst(formular?.tipStambenogProstora) || !nepraznTekst(formular?.svrhaUdomljavanja)) {
                posaljiGresku(res, 400, 'FORMULAR_NEPOPUNJEN')
                return
            }

            if (formular.svrhaUdomljavanja == 'Drugo' && !nepraznTekst(formular.svrhaUdomljavanjaOpis)) {
                posaljiGresku(res, 400, 'SVRHA_NEDEFINISANA')
                return
            }

            if (formular.imaDrugeZivotinje) {

                const brojDrugih = Number(formular.brojDrugihZivotinja)

                if (!Number.isFinite(brojDrugih) || brojDrugih <= 0 || !nepraznTekst(formular.vrstaDrugihZivotinja)) {
                    posaljiGresku(res, 400, 'DRUGE_ZIVOTINJE_NEDEFINISANO')
                    return
                }
            }

            const zivotinja = await ZivotinjaModel.findById(zivotinjaId)

            if (zivotinja == null || zivotinja.statusObjave != 'odobrena') {
                posaljiGresku(res, 404, 'OBJAVA_NE_POSTOJI')
                return
            }

            if (zivotinja.statusZivotinje == 'udomljena') {
                posaljiGresku(res, 409, 'ZIVOTINJA_UDOMLJENA')
                return
            }

            const postojeciAktivan = await TerminPoseteModel.findOne({
                korisnikId: korisnik._id,
                zivotinjaId: zivotinja._id,
                status: { $in: AKTIVNI_STATUSI }
            })

            if (postojeciAktivan != null) {
                posaljiGresku(res, 409, 'DUPLI_ZAHTEV_ZIVOTINJA')
                return
            }

            const azil = await AzilModel.findById(zivotinja.azilId)

            if (azil == null) {
                posaljiGresku(res, 404, 'AZIL_NE_POSTOJI')
                return
            }

            const trazeniTermin = new Date(datumVreme)

            const validan = await jeTerminValidanISlobodan(azil, trazeniTermin)

            if (!validan) {
                posaljiGresku(res, 409, 'TERMIN_ZAUZET')
                return
            }

            const preklapaSaDrugim = await imaPreklapajuciTerminKorisnika(korisnik._id, trazeniTermin, azil.trajanjeTermina as number || 30)

            if (preklapaSaDrugim) {
                posaljiGresku(res, 409, 'TERMIN_PREKLAPANJE')
                return
            }

            const termin = new TerminPoseteModel({
                korisnikId: korisnik._id,
                zivotinjaId: zivotinja._id,
                azilId: zivotinja.azilId,
                datumVreme: trazeniTermin,
                status: 'na_cekanju'
            })

            await termin.save()

            res.json({ poruka: 'ok' })

        } catch (err) {
            console.log(err)
            posaljiGresku(res, 500, 'GRESKA_ZAKAZIVANJE')
        }
    }

    terminiKorisnika = async (req: express.Request, res: express.Response) => {

        const korisnik = (req as any).ulogovan

        await azurirajIstekleTermine()

        const termini = await TerminPoseteModel.find({ korisnikId: korisnik._id })
            .populate('zivotinjaId', 'naziv fotografije rasa starostMeseci')
            .populate('azilId', 'naziv telefon email')
            .sort({ datumKreiranja: -1 })

        res.json(termini)
    }

    terminiAzila = async (req: express.Request, res: express.Response) => {

        const azil = (req as any).ulogovan

        await azurirajIstekleTermine()

        const termini = await TerminPoseteModel.find({ azilId: azil._id })
            .populate('zivotinjaId', 'naziv fotografije rasa starostMeseci')
            .populate('korisnikId', 'ime prezime email formular')
            .sort({ datumKreiranja: -1 })

        res.json(termini)
    }

    obradiTermin = async (req: express.Request, res: express.Response) => {

        try {
            const azil = (req as any).ulogovan
            const { status, predlozenoDatumVreme, razlog } = req.body

            if (!['odobren', 'odbijen', 'predlozen_novi'].includes(status)) {
                posaljiGresku(res, 400, 'NEISPRAVAN_STATUS')
                return
            }

            if (status == 'odbijen' && !nepraznTekst(razlog)) {
                posaljiGresku(res, 400, 'RAZLOG_ODBIJANJA_OBAVEZAN')
                return
            }

            const termin = await TerminPoseteModel.findOne({
                _id: req.params.id,
                azilId: azil._id,
                status: 'na_cekanju'
            })
                .populate('zivotinjaId', 'naziv')
                .populate('korisnikId', 'email')

            if (termin == null) {
                posaljiGresku(res, 404, 'TERMIN_NE_POSTOJI')
                return
            }

            let novoPredlozenoDatumVreme: Date | undefined = undefined

            if (status == 'predlozen_novi') {

                novoPredlozenoDatumVreme = new Date(predlozenoDatumVreme)

                if (novoPredlozenoDatumVreme.getTime() == (termin.datumVreme as Date).getTime()) {
                    posaljiGresku(res, 400, 'PREDLOG_ISTI_KAO_TRENUTNI')
                    return
                }

                const validan = await jeTerminValidanISlobodan(azil, novoPredlozenoDatumVreme, termin._id)

                if (!validan) {
                    posaljiGresku(res, 409, 'PREDLOG_NEVAZECI')
                    return
                }

                const preklapaSaDrugim = await imaPreklapajuciTerminKorisnika(
                    termin.korisnikId,
                    novoPredlozenoDatumVreme,
                    azil.trajanjeTermina as number || 30,
                    termin._id
                )

                if (preklapaSaDrugim) {
                    posaljiGresku(res, 409, 'PREDLOG_PREKLAPANJE_KORISNIKA')
                    return
                }

                termin.predlozenoDatumVreme = novoPredlozenoDatumVreme
            }

            if (status == 'odobren') {

                const zivotinjaTrenutno = await ZivotinjaModel.findById(termin.zivotinjaId)

                if (zivotinjaTrenutno == null || zivotinjaTrenutno.statusZivotinje == 'udomljena') {
                    posaljiGresku(res, 409, 'ZIVOTINJA_UDOMLJENA_MEDJUVREMENU')
                    return
                }
            }

            termin.status = status

            if (status == 'odbijen') {
                termin.napomenaAzila = razlog
            }

            await termin.save()

            await azurirajStatusZivotinje(termin.zivotinjaId)

            const zivotinja = termin.zivotinjaId as any
            const korisnik = termin.korisnikId as any

            posaljiEmailOTerminu(
                korisnik.email,
                zivotinja.naziv,
                status as any,
                {
                    azilNaziv: azil.naziv,
                    datumVreme: status == 'odobren' ? termin.datumVreme as Date : undefined,
                    predlozenoDatumVreme: status == 'predlozen_novi' ? novoPredlozenoDatumVreme : undefined,
                    razlog: status == 'odbijen' ? razlog : undefined
                }
            )

            res.json({ poruka: 'ok' })

        } catch (err) {
            console.log(err)
            posaljiGresku(res, 500, 'GRESKA_OBRADA_TERMINA')
        }
    }

    odgovoriNaPredlog = async (req: express.Request, res: express.Response) => {

        try {
            const korisnik = (req as any).ulogovan
            const { prihvata } = req.body

            const termin = await TerminPoseteModel.findOne({
                _id: req.params.id,
                korisnikId: korisnik._id,
                status: 'predlozen_novi'
            })

            if (termin == null) {
                posaljiGresku(res, 404, 'TERMIN_NE_POSTOJI')
                return
            }

            if (prihvata) {

                const azil = await AzilModel.findById(termin.azilId)

                if (azil == null || termin.predlozenoDatumVreme == null) {
                    posaljiGresku(res, 404, 'TERMIN_NE_POSTOJI')
                    return
                }

                const josUvekVazi = await jeTerminValidanISlobodan(azil, termin.predlozenoDatumVreme, termin._id)

                if (!josUvekVazi) {
                    posaljiGresku(res, 409, 'PREDLOG_ISTEKAO')
                    return
                }

                const zivotinja = await ZivotinjaModel.findById(termin.zivotinjaId)

                if (zivotinja == null || zivotinja.statusZivotinje == 'udomljena') {
                    posaljiGresku(res, 409, 'ZIVOTINJA_UDOMLJENA_MEDJUVREMENU')
                    return
                }

                const preklapaSaDrugim = await imaPreklapajuciTerminKorisnika(
                    korisnik._id,
                    termin.predlozenoDatumVreme,
                    azil.trajanjeTermina as number || 30,
                    termin._id
                )

                if (preklapaSaDrugim) {
                    posaljiGresku(res, 409, 'PRIHVATANJE_PREKLAPANJE')
                    return
                }

                termin.datumVreme = termin.predlozenoDatumVreme
                termin.predlozenoDatumVreme = undefined
                termin.status = 'odobren'
            } else {
                termin.status = 'odbijen'
            }

            await termin.save()

            await azurirajStatusZivotinje(termin.zivotinjaId)

            res.json({ poruka: 'ok' })

        } catch (err) {
            console.log(err)
            posaljiGresku(res, 500, 'GRESKA_ODGOVOR_PREDLOG')
        }
    }

    otkaziKaoAzil = async (req: express.Request, res: express.Response) => {

        try {
            const azil = (req as any).ulogovan
            const { razlog } = req.body

            if (!nepraznTekst(razlog)) {
                posaljiGresku(res, 400, 'RAZLOG_OTKAZIVANJA_OBAVEZAN')
                return
            }

            const termin = await TerminPoseteModel.findOne({
                _id: req.params.id,
                azilId: azil._id,
                status: 'odobren'
            })
                .populate('zivotinjaId', 'naziv')
                .populate('korisnikId', 'email')

            if (termin == null) {
                posaljiGresku(res, 404, 'TERMIN_NE_POSTOJI')
                return
            }

            if ((termin.datumVreme as Date) <= new Date()) {
                posaljiGresku(res, 409, 'TERMIN_PROSAO')
                return
            }

            termin.status = 'otkazan'
            termin.napomenaAzila = razlog
            await termin.save()

            await azurirajStatusZivotinje(termin.zivotinjaId)

            const zivotinjaNaziv = termin.zivotinjaId as any
            const korisnik = termin.korisnikId as any

            posaljiEmailOTerminu(korisnik.email, zivotinjaNaziv.naziv, 'otkazan', { azilNaziv: azil.naziv, datumVreme: termin.datumVreme as Date, razlog })

            res.json({ poruka: 'ok' })

        } catch (err) {
            console.log(err)
            posaljiGresku(res, 500, 'GRESKA_OTKAZIVANJE')
        }
    }

    otkaziTermin = async (req: express.Request, res: express.Response) => {

        try {
            const korisnik = (req as any).ulogovan

            const termin = await TerminPoseteModel.findOne({
                _id: req.params.id,
                korisnikId: korisnik._id,
                status: { $in: AKTIVNI_STATUSI }
            })

            if (termin == null) {
                posaljiGresku(res, 404, 'TERMIN_NE_POSTOJI')
                return
            }

            const bioOdobren = termin.status == 'odobren'

            termin.status = 'otkazan'
            await termin.save()

            if (bioOdobren) {
                const zivotinja = await ZivotinjaModel.findById(termin.zivotinjaId)

                await azurirajStatusZivotinje(termin.zivotinjaId)

                const azil = await AzilModel.findById(termin.azilId)

                if (azil != null && zivotinja != null) {
                    posaljiEmailOOtkazivanjuKorisnika(
                        azil.email as string,
                        zivotinja.naziv as string,
                        `${korisnik.ime} ${korisnik.prezime}`,
                        termin.datumVreme as Date
                    )
                }
            }

            res.json({ poruka: 'ok' })

        } catch (err) {
            console.log(err)
            posaljiGresku(res, 500, 'GRESKA_OTKAZIVANJE')
        }
    }

    oznaciNepojavljivanje = async (req: express.Request, res: express.Response) => {

        try {
            const azil = (req as any).ulogovan

            await azurirajIstekleTermine()

            const termin = await TerminPoseteModel.findOne({ _id: req.params.id, azilId: azil._id })
                .populate('zivotinjaId', 'naziv')
                .populate('korisnikId', 'email')

            if (termin == null) {
                posaljiGresku(res, 404, 'TERMIN_NE_POSTOJI')
                return
            }

            if (termin.status == 'realizovan') {
                posaljiGresku(res, 409, 'NEPOJAVLJIVANJE_ROK_ISTEKAO')
                return
            }

            if (termin.status != 'odobren') {
                posaljiGresku(res, 409, 'NEPOJAVLJIVANJE_NEDOZVOLJENO')
                return
            }

            if ((termin.datumVreme as Date) > new Date()) {
                posaljiGresku(res, 409, 'TERMIN_NIJE_POCEO')
                return
            }

            termin.status = 'otkazan'
            termin.napomenaAzila = 'Korisnik se nije pojavio na zakazani termin.'
            await termin.save()

            await azurirajStatusZivotinje(termin.zivotinjaId)

            const zivotinja = termin.zivotinjaId as any
            const korisnik = termin.korisnikId as any

            posaljiEmailOTerminu(korisnik.email, zivotinja.naziv, 'otkazan', {
                azilNaziv: azil.naziv,
                datumVreme: termin.datumVreme as Date,
                razlog: 'Niste se pojavili na zakazani termin, pa je poseta otkazana.'
            })

            res.json({ poruka: 'ok' })

        } catch (err) {
            console.log(err)
            posaljiGresku(res, 500, 'GRESKA_NEPOJAVLJIVANJE')
        }
    }
}
