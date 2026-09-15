export interface Zivotinja {
    _id: string
    azilId: any
    naziv: string
    vrsta: 'pas' | 'macka'
    rasa: string
    starostMeseci: number
    pol: string
    fotografije: string[]
    opisKaraktera: string
    sterilisan: boolean
    vakcinisan: boolean
    zdravstveneInfo: string
    statusObjave: 'na_cekanju' | 'odobrena' | 'odbijena'
    razlogOdbijanja?: string
    statusZivotinje: 'dostupna' | 'rezervisana' | 'udomljena'
    datumObjave?: string
}
