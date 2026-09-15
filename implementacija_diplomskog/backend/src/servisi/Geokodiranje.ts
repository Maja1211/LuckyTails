export async function geokodirajAdresu(adresa: string, lokacija: string): Promise<{ lat: number, lng: number } | null> {

    try {
        const upit = encodeURIComponent(`${adresa}, ${lokacija}, Srbija`)
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${upit}`

        const odgovor = await fetch(url, {
            headers: { 'User-Agent': 'LuckyTails-diplomski-rad/1.0' }
        })

        if (!odgovor.ok) {
            return null
        }

        const rezultati = await odgovor.json() as any[]

        if (rezultati.length == 0) {
            return null
        }

        return { lat: parseFloat(rezultati[0].lat), lng: parseFloat(rezultati[0].lon) }

    } catch (err) {
        console.log('Greška pri geokodiranju adrese:', err)
        return null
    }
}
