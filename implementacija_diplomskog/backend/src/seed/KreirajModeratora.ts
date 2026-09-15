import dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'
import readline from 'readline'
import bcrypt from 'bcryptjs'
import ModeratorModel from '../models/Moderator'
import { korisnickoImeZauzeto } from '../servisi/Nalozi'
import { validnoKorisnickoIme } from '../servisi/Validacija'

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

function pitaj(tekst: string): Promise<string> {
    return new Promise(resolve => rl.question(tekst, resolve))
}

async function main() {

    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017'
    const dbName = process.env.MONGO_DB_NAME || 'luckytails_db'

    await mongoose.connect(`${mongoUri}/${dbName}`)

    const ime = await pitaj('Ime moderatora: ')
    const korisnickoIme = await pitaj('Korisničko ime moderatora: ')
    const email = await pitaj('E-mail moderatora: ')
    const lozinka = await pitaj('Lozinka moderatora: ')

    rl.close()

    if (!validnoKorisnickoIme(korisnickoIme)) {
        console.log('Korisničko ime mora imati 3-30 karaktera (slova, brojevi, tačka, crtica ili donja crta).')
        await mongoose.disconnect()
        return
    }

    if (await korisnickoImeZauzeto(korisnickoIme)) {
        console.log('Korisničko ime je već zauzeto.')
        await mongoose.disconnect()
        return
    }

    const postoji = await ModeratorModel.findOne({ email })

    if (postoji != null) {
        console.log('Moderator sa ovim e-mailom već postoji.')
        await mongoose.disconnect()
        return
    }

    const sifrovanaLozinka = await bcrypt.hash(lozinka, 10)

    const moderator = new ModeratorModel({ ime, korisnickoIme, email, lozinka: sifrovanaLozinka })
    await moderator.save()

    console.log('Moderator uspešno kreiran.')

    await mongoose.disconnect()
}

main()
