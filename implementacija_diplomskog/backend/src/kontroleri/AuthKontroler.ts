import express from 'express'
import { posaljiGresku } from '../servisi/Poruke'
import bcrypt from 'bcryptjs'
import KorisnikModel from '../models/Korisnik'
import AzilModel from '../models/Azil'
import ModeratorModel from '../models/Moderator'
import { kreirajJwt, kreirajVerifikacioniToken, kreirajResetToken } from '../servisi/Tokeni'
import { posaljiVerifikacioniEmail, posaljiEmailResetovanjaLozinke } from '../servisi/Mailer'
import { dovoljnoJakaLozinka } from '../servisi/Validacija'

export class AuthKontroler {

    login = async (req: express.Request, res: express.Response) => {

        try {
            const { korisnickoIme, lozinka, uloga } = req.body

            if (uloga == 'korisnik') {

                const korisnik = await KorisnikModel.findOne({ korisnickoIme })

                if (korisnik == null || !bcrypt.compareSync(lozinka, korisnik.lozinka as string)) {
                    posaljiGresku(res, 401, 'POGRESNI_PODACI')
                    return
                }

                if (!korisnik.emailPotvrdjen) {
                    posaljiGresku(res, 403, 'EMAIL_NIJE_POTVRDJEN')
                    return
                }

                const token = kreirajJwt({ id: String(korisnik._id), uloga: 'korisnik' })

                res.json({
                    poruka: 'ok',
                    token,
                    profil: { id: korisnik._id, ime: korisnik.ime, prezime: korisnik.prezime, korisnickoIme: korisnik.korisnickoIme, email: korisnik.email }
                })
                return
            }

            if (uloga == 'azil') {

                const azil = await AzilModel.findOne({ korisnickoIme })

                if (azil == null || !bcrypt.compareSync(lozinka, azil.lozinka as string)) {
                    posaljiGresku(res, 401, 'POGRESNI_PODACI')
                    return
                }

                if (!azil.emailPotvrdjen) {
                    posaljiGresku(res, 403, 'EMAIL_NIJE_POTVRDJEN')
                    return
                }

                const token = kreirajJwt({ id: String(azil._id), uloga: 'azil' })

                res.json({
                    poruka: 'ok',
                    token,
                    profil: {
                        id: azil._id,
                        naziv: azil.naziv,
                        korisnickoIme: azil.korisnickoIme,
                        email: azil.email,
                        status: azil.status,
                        razlogOdbijanja: azil.razlogOdbijanja
                    }
                })
                return
            }

            if (uloga == 'moderator') {

                const moderator = await ModeratorModel.findOne({ korisnickoIme })

                if (moderator == null || !bcrypt.compareSync(lozinka, moderator.lozinka as string)) {
                    posaljiGresku(res, 401, 'POGRESNI_PODACI')
                    return
                }

                const token = kreirajJwt({ id: String(moderator._id), uloga: 'moderator' })

                res.json({
                    poruka: 'ok',
                    token,
                    profil: { id: moderator._id, ime: moderator.ime, korisnickoIme: moderator.korisnickoIme, email: moderator.email }
                })
                return
            }

            posaljiGresku(res, 400, 'NEPOZNATA_ULOGA')

        } catch (err) {
            console.log(err)
            posaljiGresku(res, 500, 'GRESKA_PRIJAVA')
        }
    }

    verifikujEmail = async (req: express.Request, res: express.Response) => {

        try {
            const { token, uloga } = req.body

            const Model: any = uloga == 'azil' ? AzilModel : KorisnikModel

            const nalog = await Model.findOne({
                verifikacioniToken: token,
                verifikacioniTokenIstice: { $gt: new Date() }
            })

            if (nalog == null) {
                posaljiGresku(res, 400, 'VERIFIKACIONI_LINK_NEVAZECI')
                return
            }

            nalog.emailPotvrdjen = true
            nalog.verifikacioniToken = undefined
            nalog.verifikacioniTokenIstice = undefined

            await nalog.save()

            res.json({ poruka: 'ok' })

        } catch (err) {
            console.log(err)
            posaljiGresku(res, 500, 'GRESKA_VERIFIKACIJA_EMAILA')
        }
    }

    ponovoPosaljiVerifikaciju = async (req: express.Request, res: express.Response) => {

        try {
            const { email, uloga } = req.body

            const Model: any = uloga == 'azil' ? AzilModel : KorisnikModel

            const nalog = await Model.findOne({ email })

            if (nalog != null && !nalog.emailPotvrdjen) {

                const { token, istice } = kreirajVerifikacioniToken()

                nalog.verifikacioniToken = token
                nalog.verifikacioniTokenIstice = istice
                await nalog.save()

                posaljiVerifikacioniEmail(email, token, uloga == 'azil' ? 'azil' : 'korisnik')
            }

            res.json({ poruka: 'ok' })

        } catch (err) {
            console.log(err)
            posaljiGresku(res, 500, 'GRESKA_SLANJE_VERIFIKACIJE')
        }
    }

    zaboravljenaLozinka = async (req: express.Request, res: express.Response) => {

        try {
            const { email } = req.body

            const [korisnik, azil, moderator] = await Promise.all([
                KorisnikModel.findOne({ email }),
                AzilModel.findOne({ email }),
                ModeratorModel.findOne({ email })
            ])

            const nalog = korisnik || azil || moderator
            const uloga = korisnik ? 'korisnik' : azil ? 'azil' : 'moderator'

            if (nalog != null) {

                const { token, istice } = kreirajResetToken()

                nalog.resetLozinkeToken = token
                nalog.resetLozinkeTokenIstice = istice
                await nalog.save()

                posaljiEmailResetovanjaLozinke(email, token, uloga)
            }

            res.json({ poruka: 'ok' })

        } catch (err) {
            console.log(err)
            posaljiGresku(res, 500, 'GRESKA_SLANJE_RESETA')
        }
    }

    resetujLozinku = async (req: express.Request, res: express.Response) => {

        try {
            const { token, uloga, novaLozinka } = req.body

            if (!dovoljnoJakaLozinka(novaLozinka)) {
                posaljiGresku(res, 400, 'LOZINKA_NEISPRAVNA')
                return
            }

            const Model: any = uloga == 'azil' ? AzilModel : uloga == 'moderator' ? ModeratorModel : KorisnikModel

            const nalog = await Model.findOne({
                resetLozinkeToken: token,
                resetLozinkeTokenIstice: { $gt: new Date() }
            })

            if (nalog == null) {
                posaljiGresku(res, 400, 'RESET_LINK_NEVAZECI')
                return
            }

            nalog.lozinka = await bcrypt.hash(novaLozinka, 10)
            nalog.resetLozinkeToken = undefined
            nalog.resetLozinkeTokenIstice = undefined

            await nalog.save()

            res.json({ poruka: 'ok' })

        } catch (err) {
            console.log(err)
            posaljiGresku(res, 500, 'GRESKA_RESETOVANJE_LOZINKE')
        }
    }
}
