import mongoose from 'mongoose'

const Schema = mongoose.Schema

const Formular = new Schema({
    tipStambenogProstora: String,
    imaDrugeZivotinje: Boolean,
    brojDrugihZivotinja: Number,
    vrstaDrugihZivotinja: String,
    iskustvo: String,
    svrhaUdomljavanja: String,
    svrhaUdomljavanjaOpis: String,
    ostaloRelevantno: String
}, { _id: false })

const Korisnik = new Schema({
    ime: String,
    prezime: String,
    korisnickoIme: { type: String, required: true, unique: true },
    email: String,
    lozinka: String,

    emailPotvrdjen: { type: Boolean, default: false },
    verifikacioniToken: String,
    verifikacioniTokenIstice: Date,
    resetLozinkeToken: String,
    resetLozinkeTokenIstice: Date,

    formular: Formular,

    omiljene: [{ type: Schema.Types.ObjectId, ref: 'ZivotinjaModel' }],

    datumRegistracije: { type: Date, default: Date.now }
})

export default mongoose.model('KorisnikModel', Korisnik, 'korisnici')
