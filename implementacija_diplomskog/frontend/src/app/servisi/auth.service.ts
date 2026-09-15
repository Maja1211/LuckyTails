import { Injectable, signal } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, tap } from 'rxjs'

export type Uloga = 'korisnik' | 'azil' | 'moderator'

interface OdgovorPrijave {
    poruka: string
    token: string
    profil: any
}

import { environment } from '../../environments/environment'

const API = environment.apiUrl

@Injectable({ providedIn: 'root' })
export class AuthService {

    ulogovanProfil = signal<any>(this.ucitajProfil())
    ulogovanUloga = signal<Uloga | null>(this.ucitajUlogu())

    constructor(private http: HttpClient) { }

    login(korisnickoIme: string, lozinka: string, uloga: Uloga): Observable<OdgovorPrijave> {

        return this.http.post<OdgovorPrijave>(`${API}/login`, { korisnickoIme, lozinka, uloga }).pipe(
            tap(odgovor => {
                localStorage.setItem('luckytails_token', odgovor.token)
                localStorage.setItem('luckytails_uloga', uloga)
                localStorage.setItem('luckytails_profil', JSON.stringify(odgovor.profil))
                this.ulogovanProfil.set(odgovor.profil)
                this.ulogovanUloga.set(uloga)
            })
        )
    }

    azurirajKesiraniProfil(izmene: any) {
        const spojeno = { ...this.ulogovanProfil(), ...izmene }
        localStorage.setItem('luckytails_profil', JSON.stringify(spojeno))
        this.ulogovanProfil.set(spojeno)
    }

    odjava() {
        localStorage.removeItem('luckytails_token')
        localStorage.removeItem('luckytails_uloga')
        localStorage.removeItem('luckytails_profil')
        this.ulogovanProfil.set(null)
        this.ulogovanUloga.set(null)
    }

    preuzmiToken(): string | null {
        return localStorage.getItem('luckytails_token')
    }

    jeUlogovan(): boolean {
        return this.preuzmiToken() != null
    }

    private ucitajProfil(): any {
        const sacuvano = localStorage.getItem('luckytails_profil')
        return sacuvano ? JSON.parse(sacuvano) : null
    }

    private ucitajUlogu(): Uloga | null {
        return localStorage.getItem('luckytails_uloga') as Uloga | null
    }
}
