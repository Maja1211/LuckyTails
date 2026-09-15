import TerminPoseteModel from '../models/TerminPosete'
import KorisnikModel from '../models/Korisnik'
import ZivotinjaModel from '../models/Zivotinja'
import AzilModel from '../models/Azil'
import { posaljiEmailOTerminu } from './Mailer'
import { KodPoruke } from './Poruke'

const AKTIVNI_STATUSI = ['na_cekanju', 'odobren', 'predlozen_novi']

export async function imaPreklapajuciTerminKorisnika(
    korisnikId: any,
    noviPocetak: Date,
    trajanjeMinuta: number,
    iskljuciTerminId?: any
): Promise<boolean> {

    const upit: any = { korisnikId, status: { $in: AKTIVNI_STATUSI } }

    if (iskljuciTerminId != null) {
        upit._id = { $ne: iskljuciTerminId }
    }

    const termini = await TerminPoseteModel.find(upit)
    const noviKraj = new Date(noviPocetak.getTime() + trajanjeMinuta * 60000)
    const trajanjaPoAzilu = new Map<string, number>()

    for (const termin of termini) {

        const pocetak = (termin.status == 'predlozen_novi' && termin.predlozenoDatumVreme != null
            ? termin.predlozenoDatumVreme
            : termin.datumVreme) as Date | undefined

        if (pocetak == null) {
            continue
        }

        const azilId = String(termin.azilId)

        if (!trajanjaPoAzilu.has(azilId)) {
            const azil = await AzilModel.findById(termin.azilId).select('trajanjeTermina')
            trajanjaPoAzilu.set(azilId, azil?.trajanjeTermina as number || 30)
        }

        const trajanje = trajanjaPoAzilu.get(azilId) || 30
        const kraj = new Date(pocetak.getTime() + trajanje * 60000)

        if (noviPocetak < kraj && pocetak < noviKraj) {
            return true
        }
    }

    return false
}

export async function azurirajStatusZivotinje(zivotinjaId: any): Promise<void> {

    const zivotinja = await ZivotinjaModel.findById(zivotinjaId)

    if (zivotinja == null || zivotinja.statusZivotinje == 'udomljena') {
        return
    }

    const imaOdobrenTermin = await TerminPoseteModel.exists({ zivotinjaId, status: 'odobren' })
    const noviStatus = imaOdobrenTermin != null ? 'rezervisana' : 'dostupna'

    if (zivotinja.statusZivotinje != noviStatus) {
        zivotinja.statusZivotinje = noviStatus
        await zivotinja.save()
    }
}

export async function azurirajIstekleTermine(): Promise<void> {

    const sada = new Date()

    const istekliNaCekanju = await TerminPoseteModel.find({ status: 'na_cekanju', datumVreme: { $lt: sada } })

    if (istekliNaCekanju.length > 0) {
        await TerminPoseteModel.updateMany(
            { _id: { $in: istekliNaCekanju.map(t => t._id) } },
            { $set: { status: 'otkazan', napomenaAzila: 'Zahtev je istekao - azil nije odgovorio na vreme.' } }
        )
    }

    const istekliPredlozeni = await TerminPoseteModel.find({ status: 'predlozen_novi', predlozenoDatumVreme: { $lt: sada } })

    if (istekliPredlozeni.length > 0) {
        await TerminPoseteModel.updateMany(
            { _id: { $in: istekliPredlozeni.map(t => t._id) } },
            { $set: { status: 'otkazan', napomenaAzila: 'Predloženi termin je istekao bez odgovora.' } }
        )
    }

    const odobreniKandidati = await TerminPoseteModel.find({ status: 'odobren', datumVreme: { $lt: sada } })
    const trajanjaPoAzilu = new Map<string, number>()
    const zaRealizaciju: any[] = []

    for (const termin of odobreniKandidati) {

        const azilId = String(termin.azilId)

        if (!trajanjaPoAzilu.has(azilId)) {
            const azil = await AzilModel.findById(termin.azilId).select('trajanjeTermina')
            trajanjaPoAzilu.set(azilId, azil?.trajanjeTermina as number || 30)
        }

        const trajanje = trajanjaPoAzilu.get(azilId) || 30
        const krajTermina = new Date((termin.datumVreme as Date).getTime() + trajanje * 60000)

        if (krajTermina < sada) {
            zaRealizaciju.push(termin._id)
        }
    }

    if (zaRealizaciju.length > 0) {
        await TerminPoseteModel.updateMany(
            { _id: { $in: zaRealizaciju } },
            { $set: { status: 'realizovan' } }
        )
    }

    const zivotinjeZaAzuriranje = new Set<string>([
        ...istekliNaCekanju.map(t => String(t.zivotinjaId)),
        ...istekliPredlozeni.map(t => String(t.zivotinjaId)),
        ...odobreniKandidati.filter(t => zaRealizaciju.includes(t._id)).map(t => String(t.zivotinjaId))
    ])

    for (const zivotinjaId of zivotinjeZaAzuriranje) {
        await azurirajStatusZivotinje(zivotinjaId)
    }
}

function vremeUMinute(vreme: string): number {
    const [h, m] = vreme.split(':').map(Number)
    return h * 60 + m
}

function minuteUVreme(minute: number): string {
    const h = Math.floor(minute / 60)
    const m = minute % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function formatDatumString(d: Date): string {
    const godina = d.getFullYear()
    const mesec = String(d.getMonth() + 1).padStart(2, '0')
    const dan = String(d.getDate()).padStart(2, '0')
    return `${godina}-${mesec}-${dan}`
}

export function formatVremeString(d: Date): string {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function validnoRadnoVreme(radnoVreme: any[], trajanjeTermina: any): KodPoruke | null {

    const trajanje = Number(trajanjeTermina)

    if (!Number.isFinite(trajanje) || trajanje <= 0 || trajanje > 480) {
        return 'TRAJANJE_NEISPRAVNO'
    }

    const lista = Array.isArray(radnoVreme) ? radnoVreme : []

    for (const interval of lista) {

        if (!interval?.odVremena || !interval?.doVremena || interval.odVremena >= interval.doVremena) {
            return 'RADNI_INTERVAL_NEISPRAVAN'
        }
    }

    for (let dan = 0; dan <= 6; dan++) {

        const intervaliDana = lista.filter((i: any) => i.dan == dan)

        for (let i = 0; i < intervaliDana.length; i++) {
            for (let j = i + 1; j < intervaliDana.length; j++) {

                const a = intervaliDana[i]
                const b = intervaliDana[j]

                const preklapaju = a.odVremena < b.doVremena && b.odVremena < a.doVremena

                if (preklapaju) {
                    return 'RADNI_INTERVALI_PREKLAPANJE'
                }
            }
        }
    }

    return null
}

export async function izracunajSlobodneSlotove(
    azil: any,
    datum: string,
    iskljuciTerminId?: any
): Promise<string[]> {

    const dan = new Date(datum + 'T00:00:00').getDay()
    const intervali = (azil.radnoVreme || []).filter((i: any) => i.dan == dan)

    if (intervali.length == 0) {
        return []
    }

    const trajanje = azil.trajanjeTermina || 30

    const pocetakDana = new Date(datum + 'T00:00:00')
    const krajDana = new Date(datum + 'T23:59:59')

    const upit: any = {
        azilId: azil._id,
        status: { $in: AKTIVNI_STATUSI },
        $or: [
            { datumVreme: { $gte: pocetakDana, $lte: krajDana } },
            { predlozenoDatumVreme: { $gte: pocetakDana, $lte: krajDana } }
        ]
    }

    if (iskljuciTerminId != null) {
        upit._id = { $ne: iskljuciTerminId }
    }

    const zauzeti = await TerminPoseteModel.find(upit)

    const zauzetaVremena = new Set<string>()

    zauzeti.forEach(t => {
        if (t.datumVreme != null && t.datumVreme >= pocetakDana && t.datumVreme <= krajDana) {
            zauzetaVremena.add(formatVremeString(new Date(t.datumVreme)))
        }
        if (t.status == 'predlozen_novi' && t.predlozenoDatumVreme != null) {
            zauzetaVremena.add(formatVremeString(new Date(t.predlozenoDatumVreme)))
        }
    })

    const slotovi: string[] = []

    for (const interval of intervali) {

        const krajIntervalaMin = vremeUMinute(interval.doVremena || '00:00')
        let trenutnoMin = vremeUMinute(interval.odVremena || '00:00')

        while (true) {

            const krajSlotaMin = trenutnoMin + trajanje

            if (krajSlotaMin > krajIntervalaMin) {
                break
            }

            const trenutno = minuteUVreme(trenutnoMin)

            if (!zauzetaVremena.has(trenutno)) {
                slotovi.push(trenutno)
            }

            trenutnoMin = krajSlotaMin
        }
    }

    return slotovi
}

export async function jeTerminValidanISlobodan(
    azil: any,
    datumVreme: Date,
    iskljuciTerminId?: any
): Promise<boolean> {

    if (!(datumVreme instanceof Date) || Number.isNaN(datumVreme.getTime())) {
        return false
    }

    if (datumVreme.getTime() < Date.now()) {
        return false
    }

    const datumStr = formatDatumString(datumVreme)
    const vremeStr = formatVremeString(datumVreme)

    const slobodni = await izracunajSlobodneSlotove(azil, datumStr, iskljuciTerminId)

    return slobodni.includes(vremeStr)
}

export async function otkaziAktivneTermine(
    zivotinjaId: any,
    nazivZivotinje: string,
    iskljuciTerminId?: any,
    razlog: 'udomljena' | 'nedostupna' = 'nedostupna'
): Promise<void> {

    const upit: any = { zivotinjaId, status: { $in: AKTIVNI_STATUSI } }

    if (iskljuciTerminId != null) {
        upit._id = { $ne: iskljuciTerminId }
    }

    const aktivniTermini = await TerminPoseteModel.find(upit)
    const azilNaziviPoId = new Map<string, string>()

    for (const termin of aktivniTermini) {

        termin.status = 'otkazan'
        await termin.save()

        const korisnik = await KorisnikModel.findById(termin.korisnikId)
        const azilId = String(termin.azilId)

        if (!azilNaziviPoId.has(azilId)) {
            const azil = await AzilModel.findById(termin.azilId).select('naziv')
            azilNaziviPoId.set(azilId, azil?.naziv as string || '')
        }

        if (korisnik != null) {
            posaljiEmailOTerminu(korisnik.email as string, nazivZivotinje, 'otkazan', {
                azilNaziv: azilNaziviPoId.get(azilId),
                datumVreme: termin.datumVreme as Date,
                razlogOtkazivanja: razlog
            })
        }
    }
}
