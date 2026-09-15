import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Azil } from '../models/Azil'

import { environment } from '../../environments/environment'

const API = environment.apiUrl

@Injectable({ providedIn: 'root' })
export class AzilService {

    constructor(private http: HttpClient) { }

    registracija(podaci: any) {
        return this.http.post<any>(`${API}/azil/registracija`, podaci)
    }

    profil() {
        return this.http.get<Azil>(`${API}/azil/profil`)
    }

    azurirajProfil(podaci: any) {
        return this.http.post<any>(`${API}/azil/azurirajProfil`, podaci)
    }

    obrisiNalog() {
        return this.http.post<any>(`${API}/azil/obrisiNalog`, {})
    }

    javniProfil(id: string) {
        return this.http.get<Azil>(`${API}/azil/javniProfil/${id}`)
    }

    svi() {
        return this.http.get<Azil[]>(`${API}/azil/svi`)
    }

    mozeOceniti(id: string) {
        return this.http.get<{ mozeOceniti: boolean, vecOcenio: boolean }>(`${API}/azil/mozeOceniti/${id}`)
    }

    dodajRecenziju(id: string, ocena: number, tekst: string) {
        return this.http.post<any>(`${API}/azil/dodajRecenziju/${id}`, { ocena, tekst })
    }
}
