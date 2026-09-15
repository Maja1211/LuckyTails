import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { TerminPosete } from '../models/TerminPosete'

import { environment } from '../../environments/environment'

const API = environment.apiUrl

@Injectable({ providedIn: 'root' })
export class TerminService {

    constructor(private http: HttpClient) { }

    slobodniSlotovi(azilId: string, datum: string) {
        return this.http.get<string[]>(`${API}/termin/slobodniSlotovi`, { params: { azilId, datum } })
    }

    zakazi(zivotinjaId: string, datumVreme: string) {
        return this.http.post<any>(`${API}/termin/zakazi`, { zivotinjaId, datumVreme })
    }

    moji() {
        return this.http.get<TerminPosete[]>(`${API}/termin/moji`)
    }

    azila() {
        return this.http.get<TerminPosete[]>(`${API}/termin/azila`)
    }

    obradi(id: string, status: string, predlozenoDatumVreme?: string, razlog?: string) {
        return this.http.post<any>(`${API}/termin/obradi/${id}`, { status, predlozenoDatumVreme, razlog })
    }

    odgovoriNaPredlog(id: string, prihvata: boolean) {
        return this.http.post<any>(`${API}/termin/odgovoriNaPredlog/${id}`, { prihvata })
    }

    otkazi(id: string) {
        return this.http.post<any>(`${API}/termin/otkazi/${id}`, {})
    }

    otkaziKaoAzil(id: string, razlog: string) {
        return this.http.post<any>(`${API}/termin/otkaziKaoAzil/${id}`, { razlog })
    }

    oznaciNepojavljivanje(id: string) {
        return this.http.post<any>(`${API}/termin/oznaciNepojavljivanje/${id}`, {})
    }
}
