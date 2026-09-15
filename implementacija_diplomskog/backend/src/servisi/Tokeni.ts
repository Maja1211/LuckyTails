import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET as string
const JWT_TRAJANJE = process.env.JWT_TRAJANJE || '7d'

export interface PayloadTokena {
    id: string
    uloga: 'korisnik' | 'azil' | 'moderator'
}

export function kreirajJwt(payload: PayloadTokena): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_TRAJANJE } as jwt.SignOptions)
}

export function verifikujJwt(token: string): PayloadTokena | null {
    try {
        return jwt.verify(token, JWT_SECRET) as PayloadTokena
    } catch {
        return null
    }
}

export function kreirajVerifikacioniToken(): { token: string, istice: Date } {
    return {
        token: crypto.randomBytes(32).toString('hex'),
        istice: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
}

export function kreirajResetToken(): { token: string, istice: Date } {
    return {
        token: crypto.randomBytes(32).toString('hex'),
        istice: new Date(Date.now() + 60 * 60 * 1000)
    }
}
