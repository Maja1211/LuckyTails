import mongoose from 'mongoose'

const Schema = mongoose.Schema

const Moderator = new Schema({
    ime: String,
    korisnickoIme: { type: String, required: true, unique: true },
    email: String,
    lozinka: String,
    resetLozinkeToken: String,
    resetLozinkeTokenIstice: Date,
    datumKreiranja: { type: Date, default: Date.now }
})

export default mongoose.model('ModeratorModel', Moderator, 'moderatori')
