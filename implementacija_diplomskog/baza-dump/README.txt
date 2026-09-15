Uvoz baze podataka (luckytails_db)
===================================

Preduslov: MongoDB servis mora biti pokrenut lokalno (localhost:27017).

Iz foldera "diplomski" pokrenuti (Windows cmd/PowerShell), po jednu komandu za svaku kolekciju:

alati\mongodb-database-tools-windows-x86_64-100.18.0\bin\mongoimport.exe --db=luckytails_db --collection=azili --file=baza-dump\azili.json --jsonArray
alati\mongodb-database-tools-windows-x86_64-100.18.0\bin\mongoimport.exe --db=luckytails_db --collection=korisnici --file=baza-dump\korisnici.json --jsonArray
alati\mongodb-database-tools-windows-x86_64-100.18.0\bin\mongoimport.exe --db=luckytails_db --collection=moderatori --file=baza-dump\moderatori.json --jsonArray
alati\mongodb-database-tools-windows-x86_64-100.18.0\bin\mongoimport.exe --db=luckytails_db --collection=zivotinje --file=baza-dump\zivotinje.json --jsonArray
alati\mongodb-database-tools-windows-x86_64-100.18.0\bin\mongoimport.exe --db=luckytails_db --collection=termini --file=baza-dump\termini.json --jsonArray

Nakon uvoza, pokrenuti backend (npm run dev u backend/) i frontend (npm run start u frontend/).

Prijava je preko korisničkog imena (ne e-maila). Nalozi za testiranje (svi imaju lozinku Test123!):
- Moderator: moderator
- Azili (odobreni): azil.prijatelj (Beograd), sklonistenada (Novi Sad),
  azilsrce (Niš), prijateljicetiri (Kragujevac)
- Azil na čekanju (za testiranje moderacije registracije): azilsubotica (Subotica)
- Azil odbijen (za testiranje prikaza odbijenog naloga): azilvranje (Vranje)
- Korisnici: petar.petrovic, jovana.jovanovic, marko.nikolic,
  ana.ilic, milica.stankovic, nikola.djordjevic,
  jelena.radic, stefan.pavlovic, tamara.jovanovic

(Korisničko ime je jedinstveno kroz sve tri kolekcije - korisnici, azili i moderatori.)

Baza sadrži: 6 azila (4 odobrena, 1 na čekanju, 1 odbijen), 25 životinja (pokrivaju sve statuse -
na čekanju, odobrena, odbijena, dostupna, rezervisana, udomljena), 9 korisnika, 26 termina
(pokrivaju svih 6 statusa - na_cekanju, odobren, odbijen, predlozen_novi, otkazan, realizovan).

Spremni scenariji za demonstraciju pred profesorom:
- Moderacija registracije azila: azilsubotica čeka odobrenje - uloguj se kao "moderator" i
  odobri/odbij ga na admin panelu.
- Moderacija objave životinje: pas "Toma" (Azil Prijatelj) čeka odobrenje objave.
- Ostavljanje recenzije: tamara.jovanovic ima realizovan termin (Nina, Prijatelji sa četiri šape)
  za koji JOŠ NIJE ostavljena recenzija - može se ostaviti uživo pred profesorom.
- Rezervisane životinje: Nina (Prijatelji sa četiri šape) i Snežana (Sklonište Nada) imaju odobren
  termin pa se prikazuju kao "Rezervisana".
- Udomljena životinja: Šarko (Azil Srce) - status je trajno zaključan, objava se ne može više
  editovati niti obrisati, prikazuju se samo osnovni podaci bez godina.
- Odbijena objava: Keksa (Sklonište Nada) ima razlog odbijanja ispisan na sopstvenoj stranici azila.
- Odbijen azil: azilvranje - prijavom se vidi razlog odbijanja na sopstvenom profilu.
- Postojeće recenzije za prikaz: Azil Prijatelj, Sklonište Nada, Prijatelji sa četiri šape i
  Azil Srce (Azil Srce ima dve) već imaju po jednu ostavljenu recenziju.

Radno vreme azila: sva 4 odobrena azila rade radnim danima (pon-pet), svaki sa svojim opsegom
sati i trajanjem termina (npr. Azil Srce 08:00-16:00, Sklonište Nada 10:00-18:00 itd).

Status životinje (dostupna/rezervisana/udomljena) se automatski računa na osnovu termina:
rezervisana je samo ako postoji odobren termin za tu životinju, inače dostupna. Udomljena je
trajno stanje - azil više ne može ni ručno menjati status, ni editovati, ni obrisati tu objavu.
Ako azil ne odgovori na zahtev na vreme ili korisnik ne odgovori na predlog novog termina, zahtev
se automatski otkazuje po isteku. Odobren termin postaje realizovan tek pošto prođe i njegov kraj
(datumVreme + trajanjeTermina azila) - do tog trenutka azil može da označi da se korisnik nije
pojavio (dugme "Označi nepojavljivanje" u zahtevima za termine), čime se termin otkazuje i korisnik
ne može ostaviti recenziju za tu posetu.

Fotografije po objavi: maksimalno 3 (i na backend-u i u frontend formi za dodavanje/izmenu objave).

Lokacija azila na mapi: pri registraciji azila i pri svakoj izmeni adrese/lokacije, backend automatski
šalje adresu besplatnom Nominatim (OpenStreetMap) servisu za geokodiranje i čuva lat/lng. Mapa (Leaflet +
OpenStreetMap tajlovi, bez API ključa) se prikazuje i na javnom profilu azila i u sopstvenom profilu azila,
ako su koordinate uspešno pronađene. Svih 6 azila u seed podacima je geokodirano.

Napomena: koristi se mongoexport/mongoimport umesto mongodump/mongorestore jer neki antivirus programi (npr. Avast) lažno prijavljuju mongodump.exe kao pretnju.
