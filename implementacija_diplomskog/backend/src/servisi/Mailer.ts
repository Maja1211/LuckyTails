import nodemailer from 'nodemailer'

let transporterPromise: Promise<nodemailer.Transporter> | null = null

async function preuzmiTransporter(): Promise<nodemailer.Transporter> {

    if (transporterPromise != null) {
        return transporterPromise
    }

    transporterPromise = (async () => {

        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
            return nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT) || 587,
                secure: false,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            })
        }

        const testNalog = await nodemailer.createTestAccount()

        return nodemailer.createTransport({
            host: testNalog.smtp.host,
            port: testNalog.smtp.port,
            secure: testNalog.smtp.secure,
            auth: {
                user: testNalog.user,
                pass: testNalog.pass
            }
        })
    })()

    return transporterPromise
}

async function posaljiMejl(prima: string, naslov: string, html: string) {

    try {
        const transporter = await preuzmiTransporter()

        const info = await transporter.sendMail({
            from: '"LuckyTails" <no-reply@luckytails.local>',
            to: prima,
            subject: naslov,
            html: html
        })

        const testUrl = nodemailer.getTestMessageUrl(info)

        if (testUrl) {
            console.log(`Mejl poslat: ${testUrl}`)
        }

    } catch (err) {
        console.log('Greška pri slanju mejla:', err)
    }
}

const frontendUrl = () => process.env.FRONTEND_URL || 'http://localhost:4200'

export function posaljiVerifikacioniEmail(email: string, token: string, uloga: 'korisnik' | 'azil') {

    const link = `${frontendUrl()}/verifikacija-email?token=${token}&uloga=${uloga}`

    posaljiMejl(
        email,
        'Potvrda e-mail adrese - LuckyTails',
        `<p>Dobrodošli na LuckyTails!</p>
         <p>Kliknite na link ispod da potvrdite svoju e-mail adresu:</p>
         <p><a href="${link}">${link}</a></p>
         <p>Link ističe za 24 sata.</p>`
    )
}

export function posaljiEmailResetovanjaLozinke(email: string, token: string, uloga: 'korisnik' | 'azil' | 'moderator') {

    const link = `${frontendUrl()}/nova-lozinka?token=${token}&uloga=${uloga}`

    posaljiMejl(
        email,
        'Resetovanje lozinke - LuckyTails',
        `<p>Zatraženo je resetovanje lozinke za vaš LuckyTails nalog.</p>
         <p>Kliknite na link ispod da postavite novu lozinku:</p>
         <p><a href="${link}">${link}</a></p>
         <p>Link ističe za 1 sat. Ako niste vi zatražili resetovanje, slobodno ignorišite ovaj mejl.</p>`
    )
}

export function posaljiEmailOModeracijiAzila(email: string, odobreno: boolean, razlog?: string) {

    posaljiMejl(
        email,
        odobreno ? 'Registracija azila odobrena - LuckyTails' : 'Registracija azila odbijena - LuckyTails',
        odobreno
            ? `<p>Vaš zahtev za registraciju azila je odobren. Sada se možete prijaviti na platformu.</p>`
            : `<p>Vaš zahtev za registraciju azila je odbijen.</p><p>Razlog: ${razlog || 'nije naveden'}</p>`
    )
}

export function posaljiEmailOModeracijiObjave(email: string, nazivZivotinje: string, odobreno: boolean, razlog?: string) {

    posaljiMejl(
        email,
        odobreno ? 'Objava odobrena - LuckyTails' : 'Objava odbijena - LuckyTails',
        odobreno
            ? `<p>Objava za životinju "${nazivZivotinje}" je odobrena i sada je vidljiva korisnicima.</p>`
            : `<p>Objava za životinju "${nazivZivotinje}" je odbijena.</p><p>Razlog: ${razlog || 'nije naveden'}</p>`
    )
}

export function posaljiEmailOTerminu(
    email: string,
    nazivZivotinje: string,
    status: 'odobren' | 'odbijen' | 'predlozen_novi' | 'otkazan',
    opcije?: {
        azilNaziv?: string
        datumVreme?: Date
        predlozenoDatumVreme?: Date
        razlog?: string
        razlogOtkazivanja?: 'udomljena' | 'nedostupna'
    }
) {

    const azil = opcije?.azilNaziv ? ` (azil "${opcije.azilNaziv}")` : ''
    const zakazanZa = opcije?.datumVreme ? ` zakazan za ${opcije.datumVreme.toLocaleString('sr-RS')}` : ''

    const poruke: Record<string, string> = {
        odobren: `<p>Vaš zahtev za posetu životinji "${nazivZivotinje}"${azil} je odobren${opcije?.datumVreme ? ` za ${opcije.datumVreme.toLocaleString('sr-RS')}` : ''}.</p>`,
        odbijen: `<p>Vaš zahtev za posetu životinji "${nazivZivotinje}"${azil} je odbijen.</p><p>Razlog: ${opcije?.razlog || 'nije naveden'}</p>`,
        predlozen_novi: `<p>Azil${opcije?.azilNaziv ? ` "${opcije.azilNaziv}"` : ''} je predložio novi termin za posetu životinji "${nazivZivotinje}": ${opcije?.predlozenoDatumVreme?.toLocaleString('sr-RS')}.</p>`,
        otkazan: opcije?.razlog
            ? `<p>Vaš odobreni termin za posetu životinji "${nazivZivotinje}"${azil}${zakazanZa} je otkazan od strane azila.</p><p>Razlog: ${opcije.razlog}</p>`
            : opcije?.razlogOtkazivanja == 'udomljena'
                ? `<p>Termin posete za životinju "${nazivZivotinje}"${azil}${zakazanZa} je otkazan jer je životinja pronašla dom.</p>`
                : `<p>Termin posete za životinju "${nazivZivotinje}"${azil}${zakazanZa} je otkazan jer životinja više nije dostupna za ovaj zahtev.</p>`
    }

    posaljiMejl(email, 'Status termina posete - LuckyTails', poruke[status])
}

export function posaljiEmailOOtkazivanjuKorisnika(emailAzila: string, nazivZivotinje: string, imeKorisnika: string, datumVreme: Date) {

    posaljiMejl(
        emailAzila,
        'Korisnik je otkazao termin posete - LuckyTails',
        `<p>Korisnik ${imeKorisnika} je otkazao odobreni termin posete za životinju "${nazivZivotinje}", zakazan za ${datumVreme.toLocaleString('sr-RS')}.</p>`
    )
}
