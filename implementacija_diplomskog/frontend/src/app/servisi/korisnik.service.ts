import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

import { environment } from '../../environments/environment'

const API = environment.apiUrl

@Injectable({ providedIn: 'root' })
export class KorisnikService {

    constructor(private http: HttpClient) { }

    registracija(podaci: { ime: string, prezime: string, korisnickoIme: string, email: string, lozinka: string }) {
        return this.http.post<any>(`${API}/korisnik/registracija`, podaci)
    }

    profil() {
        return this.http.get<any>(`${API}/korisnik/profil`)
    }

    azurirajProfil(podaci: any) {
        return this.http.post<any>(`${API}/korisnik/azurirajProfil`, podaci)
    }

    obrisiNalog() {
        return this.http.post<any>(`${API}/korisnik/obrisiNalog`, {})
    }

    omiljene() {
        return this.http.get<any[]>(`${API}/korisnik/omiljene`)
    }

    dodajOmiljenu(zivotinjaId: string) {
        return this.http.post<any>(`${API}/korisnik/dodajOmiljenu`, { zivotinjaId })
    }

    ukloniOmiljenu(zivotinjaId: string) {
        return this.http.post<any>(`${API}/korisnik/ukloniOmiljenu`, { zivotinjaId })
    }
}
