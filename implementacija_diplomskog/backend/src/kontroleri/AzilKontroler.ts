import express from 'express'
import { posaljiGresku } from '../servisi/Poruke'
import bcrypt from 'bcryptjs'
import AzilModel from '../models/Azil'
import ZivotinjaModel from '../models/Zivotinja'
import TerminPoseteModel from '../models/TerminPosete'
import KorisnikModel from '../models/Korisnik'
import { kreirajVerifikacioniToken } from '../servisi/Tokeni'
import { posaljiVerifikacioniEmail } from '../servisi/Mailer'
import { validanEmail, dovoljnoJakaLozinka, validanTelefon, nepraznTekst, validnoKorisnickoIme, validanBrojRacuna } from '../servisi/Validacija'
import { validnoRadnoVreme, azurirajIstekleTermine } from '../servisi/TerminValidacija'
import { korisnickoImeZauzeto, emailZauzet } from '../servisi/Nalozi'
import { geokodirajAdresu } from '../servisi/Geokodiranje'

export class AzilKontroler {

    registracija = async (req: express.Request, res: express.Response) => {

        try {
            const { naziv, korisnickoIme, email, lozinka, telefon, adresa, lokacija, opis } = req.body

            if (!nepraznTekst(naziv) || !nepraznTekst(telefon) || !nepraznTekst(adresa) || !nepraznTekst(lokacija)) {
                posaljiGresku(res, 400, 'POPUNITE_POLJA')
                return
            }

            if (!validnoKorisnickoIme(korisnickoIme)) {
                posaljiGresku(res, 400, 'KORISNICKO_IME_NEISPRAVNO')
                return
            }

            if (!validanTelefon(telefon)) {
                posaljiGresku(res, 400, 'TELEFON_NEISPRAVAN')
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
            const koordinate = await geokodirajAdresu(adresa, lokacija)

            const azil = new AzilModel({
                naziv,
                korisnickoIme,
                email,
                lozinka: sifrovanaLozinka,
                telefon,
                adresa,
                lokacija,
                lat: koordinate?.lat,
                lng: koordinate?.lng,
                opis,
                status: 'na_cekanju',
                emailPotvrdjen: false,
                verifikacioniToken: token,
                verifikacioniTokenIstice: istice
            })

            await azil.save()

            posaljiVerifikacioniEmail(email, token, 'azil')

            res.json({ poruka: 'ok' })

        } catch (err) {
            console.log(err)
            posaljiGresku(res, 500, 'GRESKA_REGISTRACIJA_AZILA')
        }
    }

    profil = async (req: express.Request, res: express.Response) => {

        const ulogovan = (req as any).ulogovan

        res.json({
            _id: ulogovan._id,
            naziv: ulogovan.naziv,
            korisnickoIme: ulogovan.korisnickoIme,
            email: ulogovan.email,
            telefon: ulogovan.telefon,
            adresa: ulogovan.adresa,
            lokacija: ulogovan.lokacija,
            lat: ulogovan.lat,
            lng: ulogovan.lng,
            opis: ulogovan.opis,
            oNama: ulogovan.oNama,
            nacinPodrske: ulogovan.nacinPodrske,
            radnoVreme: ulogovan.radnoVreme,
            trajanjeTermina: ulogovan.trajanjeTermina,
            status: ulogovan.status,
            razlogOdbijanja: ulogovan.razlogOdbijanja
        })
    }

    javniProfil = async (req: express.Request, res: express.Response) => {

        const azil = await AzilModel.findOne({ _id: req.params.id, status: 'odobren' })
            .select('-lozinka -verifikacioniToken -verifikacioniTokenIstice')

        if (azil == null) {
            posaljiGresku(res, 404, 'AZIL_NE_POSTOJI')
            return
        }

        res.json(azil)
    }

    svaOdobreniAzili = async (req: express.Request, res: express.Response) => {

        const azili = await AzilModel.find({ status: 'odobren' }).select('naziv lokacija')

        res.json(azili)
    }

    mozeOceniti = async (req: express.Request, res: express.Response) => {

        const korisnik = (req as any).ulogovan

        await azurirajIstekleTermine()

        const azil = await AzilModel.findOne({ _id: req.params.id, status: 'odobren' }).select('recenzije')

        if (azil == null) {
            posaljiGresku(res, 404, 'AZIL_NE_POSTOJI')
            return
        }

        const vecOcenio = (azil.recenzije || []).some((r: any) => String(r.korisnikId) == String(korisnik._id))

        const obavljenaPoseta = await TerminPoseteModel.findOne({
            korisnikId: korisnik._id,
            azilId: req.params.id,
            status: 'realizovan'
        })

        res.json({ mozeOceniti: obavljenaPoseta != null && !vecOcenio, vecOcenio })
    }

    dodajRecenziju = async (req: express.Request, res: express.Response) => {

        try {
            const korisnik = (req as any).ulogovan
            const { ocena, tekst } = req.body

            const ocenaBroj = Number(ocena)

            if (!Number.isInteger(ocenaBroj) || ocenaBroj < 1 || ocenaBroj > 5) {
                posaljiGresku(res, 400, 'OCENA_NEISPRAVNA')
                return
            }

            if (!nepraznTekst(tekst)) {
                posaljiGresku(res, 400, 'KOMENTAR_PRAZAN')
                return
            }

            await azurirajIstekleTermine()

            const azil = await AzilModel.findOne({ _id: req.params.id, status: 'odobren' })

            if (azil == null) {
                posaljiGresku(res, 404, 'AZIL_NE_POSTOJI')
                return
            }

            const vecOcenio = (azil.recenzije || []).some((r: any) => String(r.korisnikId) == String(korisnik._id))

            if (vecOcenio) {
                posaljiGresku(res, 409, 'RECENZIJA_VEC_POSTOJI')
                return
            }

            const obavljenaPoseta = await TerminPoseteModel.findOne({
                korisnikId: korisnik._id,
                azilId: req.params.id,
                status: 'realizovan'
            })

            if (obavljenaPoseta == null) {
                posaljiGresku(res, 403, 'RECENZIJA_NEDOZVOLJENA')
                return
            }

            azil.recenzije = azil.recenzije || []
            azil.recenzije.push({
                korisnikId: korisnik._id,
                ime: korisnik.ime,
                prezime: korisnik.prezime,
                ocena: ocenaBroj,
                tekst,
                datum: new Date()
            } as any)

            await azil.save()

            res.json({ poruka: 'ok' })

        } catch (err) {
            console.log(err)
            posaljiGresku(res, 500, 'GRESKA_RECENZIJA')
        }
    }

    azurirajProfil = async (req: express.Request, res: express.Response) => {

        try {
            const ulogovan = (req as any).ulogovan
            const { naziv, email, telefon, adresa, lokacija, opis, oNama, nacinPodrske, radnoVreme, trajanjeTermina } = req.body

            if (!nepraznTekst(naziv) || !nepraznTekst(telefon) || !nepraznTekst(adresa) || !nepraznTekst(lokacija)) {
                posaljiGresku(res, 400, 'POPUNITE_POLJA')
                return
            }

            if (!validanTelefon(telefon)) {
                posaljiGresku(res, 400, 'TELEFON_NEISPRAVAN')
                return
            }

            if (!validanEmail(email)) {
                posaljiGresku(res, 400, 'EMAIL_NEISPRAVAN')
                return
            }

            const greskaRadnogVremena = validnoRadnoVreme(radnoVreme, trajanjeTermina)

            if (greskaRadnogVremena != null) {
                posaljiGresku(res, 400, greskaRadnogVremena)
                return
            }

            if (nacinPodrske?.novcaneDonacije && !validanBrojRacuna(nacinPodrske?.brojRacuna)) {
                posaljiGresku(res, 400, 'BROJ_RACUNA_NEISPRAVAN')
                return
            }

            const emailPromenjen = email != ulogovan.email

            if (emailPromenjen) {
                if (await emailZauzet(email, String(ulogovan._id))) {
                    posaljiGresku(res, 409, 'EMAIL_ZAUZET')
                    return
                }
            }

            const adresaPromenjena = adresa != ulogovan.adresa || lokacija != ulogovan.lokacija

            if (adresaPromenjena) {
                const koordinate = await geokodirajAdresu(adresa, lokacija)
                ulogovan.lat = koordinate?.lat
                ulogovan.lng = koordinate?.lng
            }

            ulogovan.naziv = naziv
            ulogovan.email = email
            ulogovan.telefon = telefon
            ulogovan.adresa = adresa
            ulogovan.lokacija = lokacija
            ulogovan.opis = opis
            ulogovan.oNama = oNama
            ulogovan.nacinPodrske = nacinPodrske
            ulogovan.radnoVreme = radnoVreme
            ulogovan.trajanjeTermina = trajanjeTermina

            if (emailPromenjen) {
                const { token, istice } = kreirajVerifikacioniToken()
                ulogovan.emailPotvrdjen = false
                ulogovan.verifikacioniToken = token
                ulogovan.verifikacioniTokenIstice = istice
                posaljiVerifikacioniEmail(email, token, 'azil')
            }

            let ponovoPoslatoNaModeraciju = false

            if (ulogovan.status == 'odbijen') {
                ulogovan.status = 'na_cekanju'
                ulogovan.razlogOdbijanja = undefined
                ponovoPoslatoNaModeraciju = true
            }

            await ulogovan.save()

            res.json({
                poruka: 'ok',
                status: ulogovan.status,
                emailPotvrdjen: ulogovan.emailPotvrdjen,
                ponovoPoslatoNaModeraciju,
                lat: ulogovan.lat,
                lng: ulogovan.lng
            })

        } catch (err) {
            console.log(err)
            posaljiGresku(res, 500, 'GRESKA_AZURIRANJE_PROFILA_AZILA')
        }
    }

    obrisiNalog = async (req: express.Request, res: express.Response) => {

        try {
            const ulogovan = (req as any).ulogovan

            const zivotinje = await ZivotinjaModel.find({ azilId: ulogovan._id }).select('_id')
            const idZivotinja = zivotinje.map(z => z._id)

            await TerminPoseteModel.deleteMany({ zivotinjaId: { $in: idZivotinja } })
            await KorisnikModel.updateMany(
                { omiljene: { $in: idZivotinja } },
                { $pull: { omiljene: { $in: idZivotinja } } }
            )
            await ZivotinjaModel.deleteMany({ azilId: ulogovan._id })
            await AzilModel.deleteOne({ _id: ulogovan._id })

            res.json({ poruka: 'ok' })

        } catch (err) {
            console.log(err)
            posaljiGresku(res, 500, 'GRESKA_BRISANJE_NALOGA')
        }
    }
}
