const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const REGEX_LOZINKA = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,30}$/
const REGEX_TELEFON = /^\+?[\d\s\-/]{6,20}$/
const REGEX_KORISNICKO_IME = /^[A-Za-z0-9._-]{3,30}$/
const REGEX_BROJ_RACUNA = /^[0-9-]{10,30}$/

export function validanEmail(email: unknown): boolean {
    return typeof email == 'string' && REGEX_EMAIL.test(email.trim())
}

export function validnoKorisnickoIme(korisnickoIme: unknown): boolean {
    return typeof korisnickoIme == 'string' && REGEX_KORISNICKO_IME.test(korisnickoIme.trim())
}

export function dovoljnoJakaLozinka(lozinka: unknown): boolean {
    return typeof lozinka == 'string' && REGEX_LOZINKA.test(lozinka)
}

export function validanTelefon(telefon: unknown): boolean {
    if (typeof telefon != 'string' || !REGEX_TELEFON.test(telefon.trim())) {
        return false
    }
    const cifre = telefon.replace(/\D/g, '')
    return cifre.length >= 6 && cifre.length <= 15
}

export function nepraznTekst(vrednost: unknown): boolean {
    return typeof vrednost == 'string' && vrednost.trim().length > 0
}

export function pozitivanBroj(vrednost: unknown, max: number = 100): boolean {
    const broj = Number(vrednost)
    return Number.isFinite(broj) && broj >= 0 && broj <= max
}

export function validanBrojRacuna(brojRacuna: unknown): boolean {
    return typeof brojRacuna == 'string' && REGEX_BROJ_RACUNA.test(brojRacuna.trim())
}
