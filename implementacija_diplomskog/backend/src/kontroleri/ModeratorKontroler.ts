import express from 'express'
import { posaljiGresku } from '../servisi/Poruke'
import AzilModel from '../models/Azil'
import ZivotinjaModel from '../models/Zivotinja'
import KorisnikModel from '../models/Korisnik'
import TerminPoseteModel from '../models/TerminPosete'
import { posaljiEmailOModeracijiAzila, posaljiEmailOModeracijiObjave } from '../servisi/Mailer'
import { nepraznTekst } from '../servisi/Validacija'

export class ModeratorKontroler {

    zahteviRegistracijeAzila = async (req: express.Request, res: express.Response) => {

        const azili = await AzilModel.find({ status: 'na_cekanju' })
            .select('-lozinka -verifikacioniToken -verifikacioniTokenIstice')

        res.json(azili)
    }

    obradiRegistracijuAzila = async (req: express.Request, res: express.Response) => {

        try {
            const { azilId, status, razlogOdbijanja } = req.body

            if (status != 'odobren' && status != 'odbijen') {
                posaljiGresku(res, 400, 'NEISPRAVAN_STATUS')
                return
            }

            if (status == 'odbijen' && !nepraznTekst(razlogOdbijanja)) {
                posaljiGresku(res, 400, 'RAZLOG_OBAVEZAN')
                return
            }

            const azil = await AzilModel.findOneAndUpdate(
                { _id: azilId, status: 'na_cekanju' },
                { $set: { status, razlogOdbijanja: status == 'odbijen' ? razlogOdbijanja : undefined } },
                { new: true }
            )

            if (azil == null) {
                posaljiGresku(res, 404, 'ZAHTEV_NE_POSTOJI')
                return
            }

            posaljiEmailOModeracijiAzila(azil.email as string, status == 'odobren', razlogOdbijanja)

            res.json({ poruka: 'ok' })

        } catch (err) {
            console.log(err)
            posaljiGresku(res, 500, 'GRESKA_OBRADA_ZAHTEVA')
        }
    }

    objaveNaCekanju = async (req: express.Request, res: express.Response) => {

        const objave = await ZivotinjaModel.find({ statusObjave: 'na_cekanju' }).populate('azilId', 'naziv email')

        res.json(objave)
    }

    obradiObjavu = async (req: express.Request, res: express.Response) => {

        try {
            const { zivotinjaId, status, razlogOdbijanja } = req.body

            if (status != 'odobrena' && status != 'odbijena') {
                posaljiGresku(res, 400, 'NEISPRAVAN_STATUS')
                return
            }

            if (status == 'odbijena' && !nepraznTekst(razlogOdbijanja)) {
                posaljiGresku(res, 400, 'RAZLOG_OBAVEZAN')
                return
            }

            const zivotinja = await ZivotinjaModel.findOneAndUpdate(
                { _id: zivotinjaId, statusObjave: 'na_cekanju' },
                { $set: { statusObjave: status, razlogOdbijanja: status == 'odbijena' ? razlogOdbijanja : undefined } },
                { new: true }
            ).populate('azilId', 'email')

            if (zivotinja == null) {
                posaljiGresku(res, 404, 'OBJAVA_NE_POSTOJI')
                return
            }

            const azil = zivotinja.azilId as any

            posaljiEmailOModeracijiObjave(azil.email, zivotinja.naziv as string, status == 'odobrena', razlogOdbijanja)

            res.json({ poruka: 'ok' })

        } catch (err) {
            console.log(err)
            posaljiGresku(res, 500, 'GRESKA_OBRADA_OBJAVE')
        }
    }

    statistike = async (req: express.Request, res: express.Response) => {

        try {
            const [
                ukupnoAzila, azilaNaCekanju, azilaOdobrenih, azilaOdbijenih,
                ukupnoZivotinja, zivotinjaNaCekanju, zivotinjaOdobrenih, zivotinjaOdbijenih,
                zivotinjaDostupnih, zivotinjaRezervisanih, zivotinjaUdomljenih,
                ukupnoKorisnika,
                ukupnoTermina, terminaNaCekanju, terminaOdobrenih, terminaOdbijenih,
                terminaPredlozenNovi, terminaOtkazanih, terminaRealizovanih
            ] = await Promise.all([
                AzilModel.countDocuments(),
                AzilModel.countDocuments({ status: 'na_cekanju' }),
                AzilModel.countDocuments({ status: 'odobren' }),
                AzilModel.countDocuments({ status: 'odbijen' }),

                ZivotinjaModel.countDocuments(),
                ZivotinjaModel.countDocuments({ statusObjave: 'na_cekanju' }),
                ZivotinjaModel.countDocuments({ statusObjave: 'odobrena' }),
                ZivotinjaModel.countDocuments({ statusObjave: 'odbijena' }),
                ZivotinjaModel.countDocuments({ statusZivotinje: 'dostupna' }),
                ZivotinjaModel.countDocuments({ statusZivotinje: 'rezervisana' }),
                ZivotinjaModel.countDocuments({ statusZivotinje: 'udomljena' }),

                KorisnikModel.countDocuments(),

                TerminPoseteModel.countDocuments(),
                TerminPoseteModel.countDocuments({ status: 'na_cekanju' }),
                TerminPoseteModel.countDocuments({ status: 'odobren' }),
                TerminPoseteModel.countDocuments({ status: 'odbijen' }),
                TerminPoseteModel.countDocuments({ status: 'predlozen_novi' }),
                TerminPoseteModel.countDocuments({ status: 'otkazan' }),
                TerminPoseteModel.countDocuments({ status: 'realizovan' })
            ])

            const azili = await AzilModel.find({ status: 'odobren' }).select('recenzije')
            let zbirOcena = 0
            let brojOcena = 0
            for (const azil of azili) {
                for (const r of azil.recenzije as any[]) {
                    zbirOcena += r.ocena
                    brojOcena++
                }
            }
            const prosecnaOcena = brojOcena > 0 ? Math.round((zbirOcena / brojOcena) * 10) / 10 : null

            res.json({
                azili: { ukupno: ukupnoAzila, naCekanju: azilaNaCekanju, odobreni: azilaOdobrenih, odbijeni: azilaOdbijenih },
                zivotinje: {
                    ukupno: ukupnoZivotinja, naCekanju: zivotinjaNaCekanju, odobrene: zivotinjaOdobrenih, odbijene: zivotinjaOdbijenih,
                    dostupne: zivotinjaDostupnih, rezervisane: zivotinjaRezervisanih, udomljene: zivotinjaUdomljenih
                },
                korisnici: { ukupno: ukupnoKorisnika },
                termini: {
                    ukupno: ukupnoTermina, naCekanju: terminaNaCekanju, odobreni: terminaOdobrenih, odbijeni: terminaOdbijenih,
                    predlozenNovi: terminaPredlozenNovi, otkazani: terminaOtkazanih, realizovani: terminaRealizovanih
                },
                prosecnaOcenaAzila: prosecnaOcena,
                brojRecenzija: brojOcena
            })

        } catch (err) {
            console.log(err)
            posaljiGresku(res, 500, 'GRESKA_UCITAVANJE_STATISTIKE')
        }
    }
}
