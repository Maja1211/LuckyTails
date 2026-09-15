import mongoose from 'mongoose'

const Schema = mongoose.Schema

const TerminPosete = new Schema({
    korisnikId: { type: Schema.Types.ObjectId, ref: 'KorisnikModel' },
    zivotinjaId: { type: Schema.Types.ObjectId, ref: 'ZivotinjaModel' },
    azilId: { type: Schema.Types.ObjectId, ref: 'AzilModel' },

    datumVreme: Date,
    predlozenoDatumVreme: Date,

    status: { type: String, default: 'na_cekanju' },
    napomenaAzila: String,

    datumKreiranja: { type: Date, default: Date.now }
})

export default mongoose.model('TerminPoseteModel', TerminPosete, 'termini')
