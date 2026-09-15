import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Zivotinja } from '../models/Zivotinja'

import { environment } from '../../environments/environment'

const API = environment.apiUrl

export interface FilterZivotinja {
    vrsta?: string
    rasa?: string
    starostMin?: number
    starostMax?: number
    pol?: string
    sterilisan?: string
    lokacija?: string
}

@Injectable({ providedIn: 'root' })
export class ZivotinjaService {

    constructor(private http: HttpClient) { }

    pretraga(filter: FilterZivotinja) {
        return this.http.post<Zivotinja[]>(`${API}/zivotinja/pretraga`, filter)
    }

    statistika() {
        return this.http.get<{ dostupne: number, udomljene: number }>(`${API}/zivotinja/statistika`)
    }

    izdvojene() {
        return this.http.get<Zivotinja[]>(`${API}/zivotinja/izdvojene`)
    }

    rase(vrsta?: string) {
        const query = vrsta ? `?vrsta=${vrsta}` : ''
        return this.http.get<string[]>(`${API}/zivotinja/rase${query}`)
    }

    zaAzil(azilId: string) {
        return this.http.get<Zivotinja[]>(`${API}/zivotinja/azil/${azilId}`)
    }

    detalji(id: string) {
        return this.http.get<Zivotinja>(`${API}/zivotinja/${id}`)
    }

    mojeZivotinje() {
        return this.http.get<Zivotinja[]>(`${API}/zivotinja/moje`)
    }

    dodaj(formData: FormData) {
        return this.http.post<any>(`${API}/zivotinja/dodaj`, formData)
    }

    azuriraj(id: string, formData: FormData) {
        return this.http.post<any>(`${API}/zivotinja/azuriraj/${id}`, formData)
    }

    obrisi(id: string) {
        return this.http.post<any>(`${API}/zivotinja/obrisi/${id}`, {})
    }

    promeniStatus(id: string, statusZivotinje: string) {
        return this.http.post<any>(`${API}/zivotinja/promeniStatus/${id}`, { statusZivotinje })
    }

    slikaUrl(naziv: string): string {
        return `${API}/uploads/${naziv}`
    }
}
