import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

import { environment } from '../../environments/environment'

const API = environment.apiUrl

@Injectable({ providedIn: 'root' })
export class AuthApiService {

    constructor(private http: HttpClient) { }

    verifikujEmail(token: string, uloga: 'korisnik' | 'azil') {
        return this.http.post<any>(`${API}/verifikujEmail`, { token, uloga })
    }

    ponovoPosaljiVerifikaciju(email: string, uloga: 'korisnik' | 'azil') {
        return this.http.post<any>(`${API}/ponovoPosaljiVerifikaciju`, { email, uloga })
    }

    zaboravljenaLozinka(email: string) {
        return this.http.post<any>(`${API}/zaboravljenaLozinka`, { email })
    }

    resetujLozinku(token: string, uloga: 'korisnik' | 'azil' | 'moderator', novaLozinka: string) {
        return this.http.post<any>(`${API}/resetujLozinku`, { token, uloga, novaLozinka })
    }
}
