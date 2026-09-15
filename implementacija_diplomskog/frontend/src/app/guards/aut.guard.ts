import { inject } from '@angular/core'
import { CanActivateFn, Router } from '@angular/router'
import { AuthService, Uloga } from '../servisi/auth.service'

export function ulogaGuard(uloga: Uloga): CanActivateFn {

    return () => {

        const auth = inject(AuthService)
        const router = inject(Router)

        if (auth.jeUlogovan() && auth.ulogovanUloga() == uloga) {
            return true
        }

        router.navigate(['/login'])
        return false
    }
}

export function gostGuard(): CanActivateFn {

    return () => {

        const auth = inject(AuthService)
        const router = inject(Router)

        if (!auth.jeUlogovan()) {
            return true
        }

        const pocetnaPoUlozi: Record<Uloga, string> = {
            korisnik: '/pretraga',
            azil: '/moje-objave',
            moderator: '/admin'
        }

        router.navigate([pocetnaPoUlozi[auth.ulogovanUloga()!] || '/'])
        return false
    }
}

export function azilOdobrenGuard(): CanActivateFn {

    return () => {

        const auth = inject(AuthService)
        const router = inject(Router)

        if (auth.jeUlogovan() && auth.ulogovanUloga() == 'azil' && auth.ulogovanProfil()?.status == 'odobren') {
            return true
        }

        if (auth.jeUlogovan() && auth.ulogovanUloga() == 'azil') {
            router.navigate(['/profil-azila'])
            return false
        }

        router.navigate(['/login'])
        return false
    }
}
