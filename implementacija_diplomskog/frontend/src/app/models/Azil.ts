export interface RadniInterval {
    dan: number
    odVremena: string
    doVremena: string
}

export interface NacinPodrske {
    novcaneDonacije: boolean
    brojRacuna?: string
    donacijaHrane: boolean
    veterinarskaPomoc: boolean
    ostalo: string
}

export interface Recenzija {
    korisnikId: string
    ime: string
    prezime: string
    ocena: number
    tekst: string
    datum: string
}

export interface Azil {
    _id: string
    naziv: string
    korisnickoIme: string
    email: string
    telefon: string
    adresa: string
    lokacija: string
    lat?: number
    lng?: number
    opis: string
    oNama: string
    nacinPodrske?: NacinPodrske
    radnoVreme: RadniInterval[]
    trajanjeTermina: number
    recenzije?: Recenzija[]
    status: 'na_cekanju' | 'odobren' | 'odbijen'
    razlogOdbijanja?: string
    datumRegistracije?: string
}
