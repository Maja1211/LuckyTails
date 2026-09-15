import mongoose from 'mongoose'

const Schema = mongoose.Schema

const RadniInterval = new Schema({
    dan: Number,
    odVremena: String,
    doVremena: String
}, { _id: false })

const NacinPodrske = new Schema({
    novcaneDonacije: Boolean,
    brojRacuna: String,
    donacijaHrane: Boolean,
    veterinarskaPomoc: Boolean,
    ostalo: String
}, { _id: false })

const Recenzija = new Schema({
    korisnikId: { type: Schema.Types.ObjectId, ref: 'KorisnikModel' },
    ime: String,
    prezime: String,
    ocena: Number,
    tekst: String,
    datum: { type: Date, default: Date.now }
}, { _id: false })

const Azil = new Schema({
    naziv: String,
    korisnickoIme: { type: String, required: true, unique: true },
    email: String,
    lozinka: String,
    telefon: String,
    adresa: String,
    lokacija: String,
    lat: Number,
    lng: Number,

    opis: String,
    oNama: String,
    nacinPodrske: NacinPodrske,

    radnoVreme: [RadniInterval],
    trajanjeTermina: { type: Number, default: 30 },

    recenzije: [Recenzija],

    status: { type: String, default: 'na_cekanju' },
    razlogOdbijanja: String,

    emailPotvrdjen: { type: Boolean, default: false },
    verifikacioniToken: String,
    verifikacioniTokenIstice: Date,
    resetLozinkeToken: String,
    resetLozinkeTokenIstice: Date,

    datumRegistracije: { type: Date, default: Date.now }
})

export default mongoose.model('AzilModel', Azil, 'azili')
