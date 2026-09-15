import { inject } from '@angular/core'
import { HttpInterceptorFn } from '@angular/common/http'
import { Router } from '@angular/router'
import { catchError, throwError } from 'rxjs'
import { AuthService } from '../servisi/auth.service'
import { environment } from '../../environments/environment'

export const autorizacijaInterceptor: HttpInterceptorFn = (req, next) => {

    const token = localStorage.getItem('luckytails_token')

    const zahtev = (token == null || !req.url.startsWith(environment.apiUrl))
        ? req
        : req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })

    const auth = inject(AuthService)
    const router = inject(Router)

    return next(zahtev).pipe(
        catchError(greska => {

            if (greska.status == 401 && token != null && req.url.startsWith(environment.apiUrl)) {
                auth.odjava()
                router.navigate(['/login'])
            }

            return throwError(() => greska)
        })
    )
}
