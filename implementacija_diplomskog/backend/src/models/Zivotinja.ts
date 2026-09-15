import mongoose from 'mongoose'

const Schema = mongoose.Schema

const Zivotinja = new Schema({
    azilId: { type: Schema.Types.ObjectId, ref: 'AzilModel' },

    naziv: String,
    vrsta: String,
    rasa: String,
    starostMeseci: Number,
    pol: String,

    fotografije: [String],

    opisKaraktera: String,
    sterilisan: Boolean,
    vakcinisan: Boolean,
    zdravstveneInfo: String,

    statusObjave: { type: String, default: 'na_cekanju' },
    razlogOdbijanja: String,

    statusZivotinje: { type: String, default: 'dostupna' },

    datumObjave: { type: Date, default: Date.now }
})

export default mongoose.model('ZivotinjaModel', Zivotinja, 'zivotinje')
