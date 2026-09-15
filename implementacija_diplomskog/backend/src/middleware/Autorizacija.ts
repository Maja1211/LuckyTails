import express from 'express'
import { posaljiGresku } from '../servisi/Poruke'
import { verifikujJwt } from '../servisi/Tokeni'
import KorisnikModel from '../models/Korisnik'
import AzilModel from '../models/Azil'
import ModeratorModel from '../models/Moderator'

export function zahtevajUlogu(uloga?: 'korisnik' | 'azil' | 'moderator') {

    return async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {

        const zaglavlje = req.header('authorization')

        if (zaglavlje == null || !zaglavlje.startsWith('Bearer ')) {
            posaljiGresku(res, 401, 'NISTE_PRIJAVLJENI')
            return
        }

        const token = zaglavlje.substring('Bearer '.length)
        const payload = verifikujJwt(token)

        if (payload == null) {
            posaljiGresku(res, 401, 'NISTE_PRIJAVLJENI')
            return
        }

        if (uloga != null && payload.uloga != uloga) {
            posaljiGresku(res, 403, 'NEMATE_DOZVOLU')
            return
        }

        let nalog = null

        if (payload.uloga == 'korisnik') {
            nalog = await KorisnikModel.findById(payload.id)
        } else if (payload.uloga == 'azil') {
            nalog = await AzilModel.findById(payload.id)
        } else if (payload.uloga == 'moderator') {
            nalog = await ModeratorModel.findById(payload.id)
        }

        if (nalog == null) {
            posaljiGresku(res, 401, 'NISTE_PRIJAVLJENI')
            return
        }

        if (payload.uloga != 'moderator' && !(nalog as any).emailPotvrdjen) {
            posaljiGresku(res, 401, 'EMAIL_NIJE_POTVRDJEN_NALOG')
            return
        }

        (req as any).ulogovan = nalog;
        (req as any).uloga = payload.uloga;

        next()
    }
}

export function proveriIdentitet(uzmiOcekivaniId: (req: express.Request) => string) {

    return (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {

        const ulogovan = (req as any).ulogovan
        const ocekivano = uzmiOcekivaniId(req)

        if (String(ulogovan._id) != String(ocekivano)) {
            posaljiGresku(res, 403, 'NEMATE_DOZVOLU')
            return
        }

        next()
    }
}
