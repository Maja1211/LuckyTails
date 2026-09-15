import express from 'express'

export const PORUKE = {
    POGRESNI_PODACI: 'Pogrešno korisničko ime ili lozinka.',
    EMAIL_NIJE_POTVRDJEN: 'Potvrdite e-mail adresu pre prijave.',
    NEPOZNATA_ULOGA: 'Nepoznata uloga.',
    GRESKA_PRIJAVA: 'Greška pri prijavi.',
    VERIFIKACIONI_LINK_NEVAZECI: 'Link za verifikaciju nije validan ili je istekao.',
    GRESKA_VERIFIKACIJA_EMAILA: 'Greška pri verifikaciji e-maila.',
    GRESKA_SLANJE_VERIFIKACIJE: 'Greška pri slanju verifikacionog e-maila.',
    GRESKA_SLANJE_RESETA: 'Greška pri slanju mejla za resetovanje lozinke.',
    RESET_LINK_NEVAZECI: 'Link za resetovanje lozinke nije validan ili je istekao.',
    GRESKA_RESETOVANJE_LOZINKE: 'Greška pri resetovanju lozinke.',

    POPUNITE_POLJA: 'Popunite sva obavezna polja.',
    KORISNICKO_IME_NEISPRAVNO: 'Korisničko ime mora imati 3-30 karaktera (slova, brojevi, tačka, crtica ili donja crta).',
    TELEFON_NEISPRAVAN: 'Unesite ispravan broj telefona (6 do 15 cifara).',
    EMAIL_NEISPRAVAN: 'Unesite ispravnu e-mail adresu.',
    LOZINKA_NEISPRAVNA: 'Lozinka mora imati bar 6 karaktera, uz bar jedno veliko slovo, jednu cifru i jedan specijalni znak.',
    KORISNICKO_IME_ZAUZETO: 'Korisničko ime je zauzeto.',
    EMAIL_ZAUZET: 'E-mail već postoji.',
    BROJ_RACUNA_NEISPRAVAN: 'Unesite ispravan broj računa (10-30 cifara, crtice dozvoljene).',

    GRESKA_REGISTRACIJA_AZILA: 'Greška pri registraciji azila.',
    GRESKA_REGISTRACIJA: 'Greška pri registraciji.',
    AZIL_NE_POSTOJI: 'Azil ne postoji.',

    OCENA_NEISPRAVNA: 'Ocena mora biti ceo broj od 1 do 5.',
    KOMENTAR_PRAZAN: 'Komentar ne može biti prazan.',
    RECENZIJA_VEC_POSTOJI: 'Već ste ostavili recenziju za ovaj azil.',
    RECENZIJA_NEDOZVOLJENA: 'Recenziju možete ostaviti samo nakon obavljene posete ovom azilu.',
    GRESKA_RECENZIJA: 'Greška pri dodavanju recenzije.',

    TRAJANJE_NEISPRAVNO: 'Trajanje termina mora biti između 1 i 480 minuta.',
    RADNI_INTERVAL_NEISPRAVAN: 'Svaki radni interval mora imati početak pre kraja.',
    RADNI_INTERVALI_PREKLAPANJE: 'Radni intervali istog dana se ne smeju preklapati.',

    GRESKA_AZURIRANJE_PROFILA_AZILA: 'Greška pri ažuriranju profila azila.',
    GRESKA_BRISANJE_NALOGA: 'Greška pri brisanju naloga.',
    GRESKA_AZURIRANJE_PROFILA: 'Greška pri ažuriranju profila.',
    GRESKA_DODAVANJE_OMILJENE: 'Greška pri dodavanju u omiljene.',
    GRESKA_UKLANJANJE_OMILJENE: 'Greška pri uklanjanju iz omiljenih.',

    NEISPRAVAN_STATUS: 'Neispravan status.',
    RAZLOG_OBAVEZAN: 'Razlog odbijanja je obavezan.',
    ZAHTEV_NE_POSTOJI: 'Zahtev ne postoji.',
    GRESKA_OBRADA_ZAHTEVA: 'Greška pri obradi zahteva.',
    OBJAVA_NE_POSTOJI: 'Objava ne postoji.',
    GRESKA_OBRADA_OBJAVE: 'Greška pri obradi objave.',
    GRESKA_UCITAVANJE_STATISTIKE: 'Greška pri učitavanju statistike.',

    GRESKA_SLOBODNI_TERMINI: 'Greška pri učitavanju slobodnih termina.',
    FORMULAR_NEPOPUNJEN: 'Popunite formular o sebi u profilu pre zakazivanja posete - azil ga pregleda uz zahtev.',
    SVRHA_NEDEFINISANA: 'Navedite svrhu udomljavanja u formularu pre zakazivanja posete.',
    DRUGE_ZIVOTINJE_NEDEFINISANO: 'Navedite broj i vrstu drugih životinja u formularu pre zakazivanja posete.',
    ZIVOTINJA_UDOMLJENA: 'Životinja je već udomljena.',
    DUPLI_ZAHTEV_ZIVOTINJA: 'Već imate aktivan zahtev za posetu ovoj životinji. Otkažite ga ako želite da zakažete novi termin.',
    TERMIN_ZAUZET: 'Izabrani termin nije validan ili je u međuvremenu zauzet. Izaberite drugi.',
    TERMIN_PREKLAPANJE: 'Već imate zakazan termin koji se vremenski poklapa sa ovim. Izaberite drugi termin.',
    GRESKA_ZAKAZIVANJE: 'Greška pri zakazivanju termina.',

    RAZLOG_ODBIJANJA_OBAVEZAN: 'Navedite razlog odbijanja.',
    TERMIN_NE_POSTOJI: 'Termin ne postoji.',
    PREDLOG_NEVAZECI: 'Predloženi termin nije validan ili je zauzet. Izaberite drugi.',
    ZIVOTINJA_UDOMLJENA_MEDJUVREMENU: 'Životinja je u međuvremenu udomljena.',
    GRESKA_OBRADA_TERMINA: 'Greška pri obradi termina.',

    PREDLOG_ISTI_KAO_TRENUTNI: 'Predloženi termin je isti kao trenutno zahtevani termin. Ako vam odgovara, odobrite ga umesto da predlažete novi.',
    PREDLOG_PREKLAPANJE_KORISNIKA: 'Predloženi termin bi se vremenski poklopio sa drugim aktivnim terminom tog korisnika. Izaberite drugi termin.',
    PREDLOG_ISTEKAO: 'Predloženi termin više nije važeći. Zakažite novi termin.',
    PRIHVATANJE_PREKLAPANJE: 'Prihvatanje ovog termina bi se vremenski poklopilo sa drugim vašim aktivnim terminom.',
    GRESKA_ODGOVOR_PREDLOG: 'Greška pri odgovoru na predloženi termin.',

    RAZLOG_OTKAZIVANJA_OBAVEZAN: 'Navedite razlog otkazivanja.',
    TERMIN_PROSAO: 'Termin je već prošao, ne može se otkazati.',
    GRESKA_OTKAZIVANJE: 'Greška pri otkazivanju termina.',

    NEPOJAVLJIVANJE_ROK_ISTEKAO: 'Rok za prijavu nepojavljivanja je istekao - termin je već označen kao realizovan.',
    NEPOJAVLJIVANJE_NEDOZVOLJENO: 'Samo odobren termin može biti označen kao nepojavljivanje.',
    TERMIN_NIJE_POCEO: 'Termin još nije počeo.',
    GRESKA_NEPOJAVLJIVANJE: 'Greška pri označavanju nepojavljivanja.',

    AZIL_NIJE_ODOBREN: 'Azil još nije odobren od strane moderatora.',
    VRSTA_ZIVOTINJE_NEISPRAVNA: 'Izaberite vrstu životinje.',
    STAROST_NEISPRAVNA: 'Starost mora biti realan broj meseci (0-480).',
    FOTOGRAFIJA_OBAVEZNA: 'Dodajte bar jednu fotografiju životinje.',
    GRESKA_DODAVANJE_OBJAVE: 'Greška pri dodavanju objave.',
    GRESKA_AZURIRANJE_OBJAVE: 'Greška pri ažuriranju objave.',
    GRESKA_BRISANJE_OBJAVE: 'Greška pri brisanju objave.',
    STATUS_ZAKLJUCAN: 'Životinja je već udomljena - status se više ne može menjati.',
    GRESKA_AZURIRANJE_STATUSA: 'Greška pri ažuriranju statusa.',

    NISTE_PRIJAVLJENI: 'Niste prijavljeni.',
    NEMATE_DOZVOLU: 'Nemate dozvolu za ovu akciju.',
    EMAIL_NIJE_POTVRDJEN_NALOG: 'Potvrdite e-mail adresu pre nastavka korišćenja naloga.',

    LIMIT_FOTOGRAFIJA: 'Možete otpremiti najviše 3 fotografije.',
    FOTOGRAFIJA_PREVELIKA: 'Fotografija je prevelika (maksimalno 5 MB).',
    GRESKA_OBRADA_ZAHTEVA_UPLOAD: 'Greška pri obradi zahteva.'
} as const

export type KodPoruke = keyof typeof PORUKE

export function posaljiGresku(res: express.Response, status: number, kod: KodPoruke): void {
    res.status(status).json({ poruka: PORUKE[kod], kod })
}
