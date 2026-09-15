export interface Formular {
    tipStambenogProstora: string
    imaDrugeZivotinje: boolean
    brojDrugihZivotinja?: number
    vrstaDrugihZivotinja?: string
    iskustvo: string
    svrhaUdomljavanja: string
    svrhaUdomljavanjaOpis?: string
    ostaloRelevantno: string
}

export interface Korisnik {
    id: string
    ime: string
    prezime: string
    korisnickoIme: string
    email: string
    formular?: Formular
}
