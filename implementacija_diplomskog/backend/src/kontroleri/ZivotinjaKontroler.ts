import express from 'express'
import { posaljiGresku, KodPoruke } from '../servisi/Poruke'
import ZivotinjaModel from '../models/Zivotinja'
import TerminPoseteModel from '../models/TerminPosete'
import KorisnikModel from '../models/Korisnik'
import { nepraznTekst, pozitivanBroj } from '../servisi/Validacija'
import { otkaziAktivneTermine } from '../servisi/TerminValidacija'

function validnaZivotinja(body: any): KodPoruke | null {

    if (!nepraznTekst(body.naziv) || !nepraznTekst(body.rasa) || !nepraznTekst(body.opisKaraktera)) {
        return 'POPUNITE_POLJA'
    }

    if (body.vrsta != 'pas' && body.vrsta != 'macka') {
        return 'VRSTA_ZIVOTINJE_NEISPRAVNA'
    }

    if (!pozitivanBroj(body.starostMeseci, 480)) {
        return 'STAROST_NEISPRAVNA'
    }

    return null
}

export class ZivotinjaKontroler {

    dodajZivotinju = async (req: express.Request, res: express.Response) => {

        try {
            const azil = (req as any).ulogovan

            if (azil.status != 'odobren') {
                posaljiGresku(res, 403, 'AZIL_NIJE_ODOBREN')
                return
            }

            const greska = validnaZivotinja(req.body)

            if (greska != null) {
                posaljiGresku(res, 400, greska)
                return
            }

            const { naziv, vrsta, rasa, starostMeseci, pol, opisKaraktera, sterilisan, vakcinisan, zdravstveneInfo } = req.body

            const fotografije = req.files != null
                ? (req.files as Express.Multer.File[]).map(f => f.filename)
                : []

            if (fotografije.length == 0) {
                posaljiGresku(res, 400, 'FOTOGRAFIJA_OBAVEZNA')
                return
            }

            const zivotinja = new ZivotinjaModel({
                azilId: azil._id,
                naziv,
                vrsta,
                rasa,
                starostMeseci,
                pol,
                opisKaraktera,
                sterilisan: sterilisan == 'true' || sterilisan == true,
                vakcinisan: vakcinisan == 'true' || vakcinisan == true,
                zdravstveneInfo,
                fotografije,
                statusObjave: 'na_cekanju',
                statusZivotinje: 'dostupna'
            })

            await zivotinja.save()

            res.json({ poruka: 'ok' })

        } catch (err) {
            console.log(err)
            posaljiGresku(res, 500, 'GRESKA_DODAVANJE_OBJAVE')
        }
    }

    azurirajZivotinju = async (req: express.Request, res: express.Response) => {

        try {
            const azil = (req as any).ulogovan

            const zivotinja = await ZivotinjaModel.findOne({ _id: req.params.id, azilId: azil._id })

            if (zivotinja == null) {
                posaljiGresku(res, 404, 'OBJAVA_NE_POSTOJI')
                return
            }

            if (zivotinja.statusZivotinje == 'udomljena') {
                posaljiGresku(res, 409, 'STATUS_ZAKLJUCAN')
                return
            }

            const greska = validnaZivotinja(req.body)

            if (greska != null) {
                posaljiGresku(res, 400, greska)
                return
            }

            const { naziv, vrsta, rasa, starostMeseci, pol, opisKaraktera, sterilisan, vakcinisan, zdravstveneInfo } = req.body

            zivotinja.naziv = naziv
            zivotinja.vrsta = vrsta
            zivotinja.rasa = rasa
            zivotinja.starostMeseci = starostMeseci
            zivotinja.pol = pol
            zivotinja.opisKaraktera = opisKaraktera
            zivotinja.sterilisan = sterilisan == 'true' || sterilisan == true
            zivotinja.vakcinisan = vakcinisan == 'true' || vakcinisan == true
            zivotinja.zdravstveneInfo = zdravstveneInfo

            if (req.files != null && (req.files as Express.Multer.File[]).length > 0) {
                zivotinja.fotografije = (req.files as Express.Multer.File[]).map(f => f.filename)
            }

            zivotinja.statusObjave = 'na_cekanju'
            zivotinja.razlogOdbijanja = undefined

            await zivotinja.save()

            res.json({ poruka: 'ok' })

        } catch (err) {
            console.log(err)
            posaljiGresku(res, 500, 'GRESKA_AZURIRANJE_OBJAVE')
        }
    }

    obrisiZivotinju = async (req: express.Request, res: express.Response) => {

        try {
            const azil = (req as any).ulogovan

            const zivotinja = await ZivotinjaModel.findOne({ _id: req.params.id, azilId: azil._id })

            if (zivotinja == null) {
                posaljiGresku(res, 404, 'OBJAVA_NE_POSTOJI')
                return
            }

            if (zivotinja.statusZivotinje == 'udomljena') {
                posaljiGresku(res, 409, 'STATUS_ZAKLJUCAN')
                return
            }

            await otkaziAktivneTermine(zivotinja._id, zivotinja.naziv as string)
            await TerminPoseteModel.deleteMany({ zivotinjaId: zivotinja._id })
            await KorisnikModel.updateMany({ omiljene: zivotinja._id }, { $pull: { omiljene: zivotinja._id } })
            await ZivotinjaModel.deleteOne({ _id: zivotinja._id })

            res.json({ poruka: 'ok' })

        } catch (err) {
            console.log(err)
            posaljiGresku(res, 500, 'GRESKA_BRISANJE_OBJAVE')
        }
    }

    mojeZivotinje = async (req: express.Request, res: express.Response) => {

        const azil = (req as any).ulogovan

        const zivotinje = await ZivotinjaModel.find({ azilId: azil._id }).sort({ datumObjave: -1 })

        res.json(zivotinje)
    }

    pretraga = async (req: express.Request, res: express.Response) => {

        const { vrsta, rasa, starostMin, starostMax, pol, sterilisan, lokacija } = req.body

        const upit: any = { statusObjave: 'odobrena', statusZivotinje: { $ne: 'udomljena' } }

        if (vrsta) upit.vrsta = vrsta
        if (rasa) upit.rasa = new RegExp(rasa, 'i')
        if (pol) upit.pol = pol
        if (sterilisan != null && sterilisan != '') upit.sterilisan = sterilisan == 'true' || sterilisan == true

        if (starostMin != null || starostMax != null) {
            let min = starostMin != null ? Number(starostMin) : null
            let max = starostMax != null ? Number(starostMax) : null

            if (min != null && max != null && max < min) {
                [min, max] = [max, min]
            }

            upit.starostMeseci = {}
            if (min != null) upit.starostMeseci.$gte = min * 12
            if (max != null) upit.starostMeseci.$lte = max * 12 + 11
        }

        let zivotinje = await ZivotinjaModel.find(upit).populate('azilId', 'naziv lokacija').sort({ datumObjave: -1 })

        if (lokacija) {
            zivotinje = zivotinje.filter((z: any) => z.azilId?.lokacija?.toLowerCase().includes(String(lokacija).toLowerCase()))
        }

        res.json(zivotinje)
    }

    zaAzil = async (req: express.Request, res: express.Response) => {

        const zivotinje = await ZivotinjaModel.find({ azilId: req.params.azilId, statusObjave: 'odobrena' })
            .sort({ datumObjave: -1 })

        res.json(zivotinje)
    }

    rase = async (req: express.Request, res: express.Response) => {

        const upit: any = {}
        if (req.query.vrsta) upit.vrsta = req.query.vrsta

        const rase = await ZivotinjaModel.distinct('rasa', upit)

        res.json(rase.filter(r => r).sort((a: string, b: string) => a.localeCompare(b, 'sr')))
    }

    statistika = async (req: express.Request, res: express.Response) => {

        const [dostupne, udomljene] = await Promise.all([
            ZivotinjaModel.countDocuments({ statusObjave: 'odobrena', statusZivotinje: 'dostupna' }),
            ZivotinjaModel.countDocuments({ statusZivotinje: 'udomljena' })
        ])

        res.json({ dostupne, udomljene })
    }

    izdvojene = async (req: express.Request, res: express.Response) => {

        const zivotinje = await ZivotinjaModel.find({ statusObjave: 'odobrena', statusZivotinje: 'dostupna' })
            .populate('azilId', 'naziv lokacija')
            .sort({ datumObjave: -1 })
            .limit(3)

        res.json(zivotinje)
    }

    detalji = async (req: express.Request, res: express.Response) => {

        const zivotinja = await ZivotinjaModel.findOne({ _id: req.params.id, statusObjave: 'odobrena' })
            .populate('azilId', 'naziv lokacija telefon email adresa')

        if (zivotinja == null) {
            posaljiGresku(res, 404, 'OBJAVA_NE_POSTOJI')
            return
        }

        res.json(zivotinja)
    }

    promeniStatusZivotinje = async (req: express.Request, res: express.Response) => {

        try {
            const azil = (req as any).ulogovan
            const { statusZivotinje } = req.body

            if (!['dostupna', 'rezervisana', 'udomljena'].includes(statusZivotinje)) {
                posaljiGresku(res, 400, 'NEISPRAVAN_STATUS')
                return
            }

            const zivotinja = await ZivotinjaModel.findOne({ _id: req.params.id, azilId: azil._id })

            if (zivotinja == null) {
                posaljiGresku(res, 404, 'OBJAVA_NE_POSTOJI')
                return
            }

            if (zivotinja.statusZivotinje == 'udomljena') {
                posaljiGresku(res, 409, 'STATUS_ZAKLJUCAN')
                return
            }

            zivotinja.statusZivotinje = statusZivotinje
            await zivotinja.save()

            if (statusZivotinje == 'udomljena') {
                await otkaziAktivneTermine(zivotinja._id, zivotinja.naziv as string, undefined, 'udomljena')
            }

            res.json({ poruka: 'ok' })

        } catch (err) {
            console.log(err)
            posaljiGresku(res, 500, 'GRESKA_AZURIRANJE_STATUSA')
        }
    }
}
