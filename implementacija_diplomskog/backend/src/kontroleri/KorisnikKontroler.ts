import express from 'express'
import { posaljiGresku } from '../servisi/Poruke'
import bcrypt from 'bcryptjs'
import KorisnikModel from '../models/Korisnik'
import AzilModel from '../models/Azil'
import TerminPoseteModel from '../models/TerminPosete'
import { kreirajVerifikacioniToken } from '../servisi/Tokeni'
import { posaljiVerifikacioniEmail } from '../servisi/Mailer'
import { validanEmail, dovoljnoJakaLozinka, nepraznTekst, validnoKorisnickoIme } from '../servisi/Validacija'
import { korisnickoImeZauzeto, emailZauzet } from '../servisi/Nalozi'
import { azurirajStatusZivotinje } from '../servisi/TerminValidacija'

export class KorisnikKontroler {

    registracija = async (req: express.Request, res: express.Response) => {

        try {
            const { ime, prezime, korisnickoIme, email, lozinka } = req.body

            if (!nepraznTekst(ime) || !nepraznTekst(prezime)) {
                posaljiGresku(res, 400, 'POPUNITE_POLJA')
                return
            }

            if (!validnoKorisnickoIme(korisnickoIme)) {
                posaljiGresku(res, 400, 'KORISNICKO_IME_NEISPRAVNO')
                return
            }

            if (!validanEmail(email)) {
                posaljiGresku(res, 400, 'EMAIL_NEISPRAVAN')
                return
            }

            if (!dovoljnoJakaLozinka(lozinka)) {
                posaljiGresku(res, 400, 'LOZINKA_NEISPRAVNA')
                return
            }

            if (await korisnickoImeZauzeto(korisnickoIme)) {
                posaljiGresku(res, 409, 'KORISNICKO_IME_ZAUZETO')
                return
            }

            if (await emailZauzet(email)) {
                posaljiGresku(res, 409, 'EMAIL_ZAUZET')
                return
            }

            const sifrovanaLozinka = await bcrypt.hash(lozinka, 10)
            const { token, istice } = kreirajVerifikacioniToken()

            const korisnik = new KorisnikModel({
                ime,
                prezime,
                korisnickoIme,
                email,
                lozinka: sifrovanaLozinka,
                emailPotvrdjen: false,
                verifikacioniToken: token,
                verifikacioniTokenIstice: istice
            })

            await korisnik.save()

            posaljiVerifikacioniEmail(email, token, 'korisnik')

            res.json({ poruka: 'ok' })

        } catch (err) {
            console.log(err)
            posaljiGresku(res, 500, 'GRESKA_REGISTRACIJA')
        }
    }

    profil = async (req: express.Request, res: express.Response) => {

        const ulogovan = (req as any).ulogovan

        res.json({
            id: ulogovan._id,
            ime: ulogovan.ime,
            prezime: ulogovan.prezime,
            korisnickoIme: ulogovan.korisnickoIme,
            email: ulogovan.email,
            formular: ulogovan.formular
        })
    }

    azurirajProfil = async (req: express.Request, res: express.Response) => {

        try {
            const ulogovan = (req as any).ulogovan
            const { ime, prezime, email, formular } = req.body

            if (!nepraznTekst(ime) || !nepraznTekst(prezime)) {
                posaljiGresku(res, 400, 'POPUNITE_POLJA')
                return
            }

            if (!validanEmail(email)) {
                posaljiGresku(res, 400, 'EMAIL_NEISPRAVAN')
                return
            }

            const emailPromenjen = email != ulogovan.email

            if (emailPromenjen) {
                if (await emailZauzet(email, String(ulogovan._id))) {
                    posaljiGresku(res, 409, 'EMAIL_ZAUZET')
                    return
                }
            }

            ulogovan.ime = ime
            ulogovan.prezime = prezime
            ulogovan.email = email
            ulogovan.formular = formular

            if (emailPromenjen) {
                const { token, istice } = kreirajVerifikacioniToken()
                ulogovan.emailPotvrdjen = false
                ulogovan.verifikacioniToken = token
                ulogovan.verifikacioniTokenIstice = istice
                posaljiVerifikacioniEmail(email, token, 'korisnik')
            }

            await ulogovan.save()

            res.json({ poruka: 'ok', emailPotvrdjen: ulogovan.emailPotvrdjen })

        } catch (err) {
            console.log(err)
            posaljiGresku(res, 500, 'GRESKA_AZURIRANJE_PROFILA')
        }
    }

    obrisiNalog = async (req: express.Request, res: express.Response) => {

        try {
            const ulogovan = (req as any).ulogovan

            const odobreniTermini = await TerminPoseteModel.find({ korisnikId: ulogovan._id, status: 'odobren' })
            const zivotinjeZaAzuriranje = odobreniTermini.map(t => t.zivotinjaId)

            await TerminPoseteModel.deleteMany({ korisnikId: ulogovan._id })

            for (const zivotinjaId of zivotinjeZaAzuriranje) {
                await azurirajStatusZivotinje(zivotinjaId)
            }

            await AzilModel.updateMany(
                { 'recenzije.korisnikId': ulogovan._id },
                { $set: { 'recenzije.$[r].ime': '', 'recenzije.$[r].prezime': '' } },
                { arrayFilters: [{ 'r.korisnikId': ulogovan._id }] }
            )

            await KorisnikModel.deleteOne({ _id: ulogovan._id })

            res.json({ poruka: 'ok' })

        } catch (err) {
            console.log(err)
            posaljiGresku(res, 500, 'GRESKA_BRISANJE_NALOGA')
        }
    }

    omiljene = async (req: express.Request, res: express.Response) => {

        const ulogovan = (req as any).ulogovan

        const korisnik = await KorisnikModel.findById(ulogovan._id).populate('omiljene')

        res.json(korisnik?.omiljene || [])
    }

    dodajOmiljenu = async (req: express.Request, res: express.Response) => {

        try {
            const ulogovan = (req as any).ulogovan
            const { zivotinjaId } = req.body

            await KorisnikModel.updateOne(
                { _id: ulogovan._id },
                { $addToSet: { omiljene: zivotinjaId } }
            )

            res.json({ poruka: 'ok' })

        } catch (err) {
            console.log(err)
            posaljiGresku(res, 500, 'GRESKA_DODAVANJE_OMILJENE')
        }
    }

    ukloniOmiljenu = async (req: express.Request, res: express.Response) => {

        try {
            const ulogovan = (req as any).ulogovan
            const { zivotinjaId } = req.body

            await KorisnikModel.updateOne(
                { _id: ulogovan._id },
                { $pull: { omiljene: zivotinjaId } }
            )

            res.json({ poruka: 'ok' })

        } catch (err) {
            console.log(err)
            posaljiGresku(res, 500, 'GRESKA_UKLANJANJE_OMILJENE')
        }
    }
}
