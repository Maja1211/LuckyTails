import KorisnikModel from '../models/Korisnik'
import AzilModel from '../models/Azil'
import ModeratorModel from '../models/Moderator'

export async function korisnickoImeZauzeto(korisnickoIme: string): Promise<boolean> {

    const [korisnik, azil, moderator] = await Promise.all([
        KorisnikModel.findOne({ korisnickoIme }),
        AzilModel.findOne({ korisnickoIme }),
        ModeratorModel.findOne({ korisnickoIme })
    ])

    return korisnik != null || azil != null || moderator != null
}

export async function emailZauzet(email: string, izuzetiId?: string): Promise<boolean> {

    const [korisnik, azil, moderator] = await Promise.all([
        KorisnikModel.findOne({ email, _id: { $ne: izuzetiId ?? null } }),
        AzilModel.findOne({ email, _id: { $ne: izuzetiId ?? null } }),
        ModeratorModel.findOne({ email, _id: { $ne: izuzetiId ?? null } })
    ])

    return korisnik != null || azil != null || moderator != null
}
