import multer from 'multer'
import express from 'express'
import { AuthKontroler } from '../kontroleri/AuthKontroler'
import { KorisnikKontroler } from '../kontroleri/KorisnikKontroler'
import { AzilKontroler } from '../kontroleri/AzilKontroler'
import { ModeratorKontroler } from '../kontroleri/ModeratorKontroler'
import { ZivotinjaKontroler } from '../kontroleri/ZivotinjaKontroler'
import { TerminKontroler } from '../kontroleri/TerminKontroler'
import { zahtevajUlogu, proveriIdentitet } from '../middleware/Autorizacija'

const ruter = express.Router()

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '_' + file.originalname)
    }
})

const DOZVOLJENI_TIPOVI_SLIKA = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

const MAX_FOTOGRAFIJA = 3

const uploadFotografije = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024, files: MAX_FOTOGRAFIJA },
    fileFilter: (req, file, cb) => {
        if (DOZVOLJENI_TIPOVI_SLIKA.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error('Dozvoljene su samo slike (JPEG, PNG, WEBP, GIF).'))
        }
    }
}).array('fotografije', MAX_FOTOGRAFIJA)


ruter.route('/login').post(
    (req, res) => new AuthKontroler().login(req, res)
)

ruter.route('/verifikujEmail').post(
    (req, res) => new AuthKontroler().verifikujEmail(req, res)
)

ruter.route('/ponovoPosaljiVerifikaciju').post(
    (req, res) => new AuthKontroler().ponovoPosaljiVerifikaciju(req, res)
)

ruter.route('/zaboravljenaLozinka').post(
    (req, res) => new AuthKontroler().zaboravljenaLozinka(req, res)
)

ruter.route('/resetujLozinku').post(
    (req, res) => new AuthKontroler().resetujLozinku(req, res)
)


ruter.route('/korisnik/registracija').post(
    (req, res) => new KorisnikKontroler().registracija(req, res)
)

ruter.route('/korisnik/profil').get(
    zahtevajUlogu('korisnik'),
    (req, res) => new KorisnikKontroler().profil(req, res)
)

ruter.route('/korisnik/azurirajProfil').post(
    zahtevajUlogu('korisnik'),
    (req, res) => new KorisnikKontroler().azurirajProfil(req, res)
)

ruter.route('/korisnik/obrisiNalog').post(
    zahtevajUlogu('korisnik'),
    (req, res) => new KorisnikKontroler().obrisiNalog(req, res)
)

ruter.route('/korisnik/omiljene').get(
    zahtevajUlogu('korisnik'),
    (req, res) => new KorisnikKontroler().omiljene(req, res)
)

ruter.route('/korisnik/dodajOmiljenu').post(
    zahtevajUlogu('korisnik'),
    (req, res) => new KorisnikKontroler().dodajOmiljenu(req, res)
)

ruter.route('/korisnik/ukloniOmiljenu').post(
    zahtevajUlogu('korisnik'),
    (req, res) => new KorisnikKontroler().ukloniOmiljenu(req, res)
)


ruter.route('/azil/registracija').post(
    (req, res) => new AzilKontroler().registracija(req, res)
)

ruter.route('/azil/profil').get(
    zahtevajUlogu('azil'),
    (req, res) => new AzilKontroler().profil(req, res)
)

ruter.route('/azil/azurirajProfil').post(
    zahtevajUlogu('azil'),
    (req, res) => new AzilKontroler().azurirajProfil(req, res)
)

ruter.route('/azil/obrisiNalog').post(
    zahtevajUlogu('azil'),
    (req, res) => new AzilKontroler().obrisiNalog(req, res)
)

ruter.route('/azil/javniProfil/:id').get(
    (req, res) => new AzilKontroler().javniProfil(req, res)
)

ruter.route('/azil/svi').get(
    (req, res) => new AzilKontroler().svaOdobreniAzili(req, res)
)

ruter.route('/azil/mozeOceniti/:id').get(
    zahtevajUlogu('korisnik'),
    (req, res) => new AzilKontroler().mozeOceniti(req, res)
)

ruter.route('/azil/dodajRecenziju/:id').post(
    zahtevajUlogu('korisnik'),
    (req, res) => new AzilKontroler().dodajRecenziju(req, res)
)


ruter.route('/moderator/zahteviRegistracijeAzila').get(
    zahtevajUlogu('moderator'),
    (req, res) => new ModeratorKontroler().zahteviRegistracijeAzila(req, res)
)

ruter.route('/moderator/obradiRegistracijuAzila').post(
    zahtevajUlogu('moderator'),
    (req, res) => new ModeratorKontroler().obradiRegistracijuAzila(req, res)
)

ruter.route('/moderator/objaveNaCekanju').get(
    zahtevajUlogu('moderator'),
    (req, res) => new ModeratorKontroler().objaveNaCekanju(req, res)
)

ruter.route('/moderator/obradiObjavu').post(
    zahtevajUlogu('moderator'),
    (req, res) => new ModeratorKontroler().obradiObjavu(req, res)
)

ruter.route('/moderator/statistike').get(
    zahtevajUlogu('moderator'),
    (req, res) => new ModeratorKontroler().statistike(req, res)
)


ruter.route('/zivotinja/dodaj').post(
    zahtevajUlogu('azil'),
    uploadFotografije,
    (req, res) => new ZivotinjaKontroler().dodajZivotinju(req, res)
)

ruter.route('/zivotinja/azuriraj/:id').post(
    zahtevajUlogu('azil'),
    uploadFotografije,
    (req, res) => new ZivotinjaKontroler().azurirajZivotinju(req, res)
)

ruter.route('/zivotinja/obrisi/:id').post(
    zahtevajUlogu('azil'),
    (req, res) => new ZivotinjaKontroler().obrisiZivotinju(req, res)
)

ruter.route('/zivotinja/moje').get(
    zahtevajUlogu('azil'),
    (req, res) => new ZivotinjaKontroler().mojeZivotinje(req, res)
)

ruter.route('/zivotinja/promeniStatus/:id').post(
    zahtevajUlogu('azil'),
    (req, res) => new ZivotinjaKontroler().promeniStatusZivotinje(req, res)
)

ruter.route('/zivotinja/pretraga').post(
    (req, res) => new ZivotinjaKontroler().pretraga(req, res)
)

ruter.route('/zivotinja/statistika').get(
    (req, res) => new ZivotinjaKontroler().statistika(req, res)
)

ruter.route('/zivotinja/izdvojene').get(
    (req, res) => new ZivotinjaKontroler().izdvojene(req, res)
)

ruter.route('/zivotinja/rase').get(
    (req, res) => new ZivotinjaKontroler().rase(req, res)
)

ruter.route('/zivotinja/azil/:azilId').get(
    (req, res) => new ZivotinjaKontroler().zaAzil(req, res)
)

ruter.route('/zivotinja/:id').get(
    (req, res) => new ZivotinjaKontroler().detalji(req, res)
)


ruter.route('/termin/slobodniSlotovi').get(
    (req, res) => new TerminKontroler().slobodniSlotovi(req, res)
)

ruter.route('/termin/zakazi').post(
    zahtevajUlogu('korisnik'),
    (req, res) => new TerminKontroler().zakaziTermin(req, res)
)

ruter.route('/termin/moji').get(
    zahtevajUlogu('korisnik'),
    (req, res) => new TerminKontroler().terminiKorisnika(req, res)
)

ruter.route('/termin/azila').get(
    zahtevajUlogu('azil'),
    (req, res) => new TerminKontroler().terminiAzila(req, res)
)

ruter.route('/termin/obradi/:id').post(
    zahtevajUlogu('azil'),
    (req, res) => new TerminKontroler().obradiTermin(req, res)
)

ruter.route('/termin/odgovoriNaPredlog/:id').post(
    zahtevajUlogu('korisnik'),
    (req, res) => new TerminKontroler().odgovoriNaPredlog(req, res)
)

ruter.route('/termin/otkazi/:id').post(
    zahtevajUlogu('korisnik'),
    (req, res) => new TerminKontroler().otkaziTermin(req, res)
)

ruter.route('/termin/otkaziKaoAzil/:id').post(
    zahtevajUlogu('azil'),
    (req, res) => new TerminKontroler().otkaziKaoAzil(req, res)
)

ruter.route('/termin/oznaciNepojavljivanje/:id').post(
    zahtevajUlogu('azil'),
    (req, res) => new TerminKontroler().oznaciNepojavljivanje(req, res)
)

export default ruter
