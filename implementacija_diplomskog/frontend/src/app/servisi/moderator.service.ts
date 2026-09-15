import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

import { environment } from '../../environments/environment'

const API = environment.apiUrl

@Injectable({ providedIn: 'root' })
export class ModeratorService {

    constructor(private http: HttpClient) { }

    zahteviRegistracijeAzila() {
        return this.http.get<any[]>(`${API}/moderator/zahteviRegistracijeAzila`)
    }

    obradiRegistracijuAzila(azilId: string, status: string, razlogOdbijanja?: string) {
        return this.http.post<any>(`${API}/moderator/obradiRegistracijuAzila`, { azilId, status, razlogOdbijanja })
    }

    objaveNaCekanju() {
        return this.http.get<any[]>(`${API}/moderator/objaveNaCekanju`)
    }

    obradiObjavu(zivotinjaId: string, status: string, razlogOdbijanja?: string) {
        return this.http.post<any>(`${API}/moderator/obradiObjavu`, { zivotinjaId, status, razlogOdbijanja })
    }

    statistike() {
        return this.http.get<any>(`${API}/moderator/statistike`)
    }
}
