export interface TerminPosete {
    _id: string
    korisnikId: any
    zivotinjaId: any
    azilId: any
    datumVreme: string
    predlozenoDatumVreme?: string
    status: 'na_cekanju' | 'odobren' | 'odbijen' | 'predlozen_novi' | 'otkazan' | 'realizovan'
    napomenaAzila?: string
    datumKreiranja?: string
}
