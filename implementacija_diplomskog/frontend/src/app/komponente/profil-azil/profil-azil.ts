import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AzilService } from '../../servisi/azil.service';
import { AuthService } from '../../servisi/auth.service';
import { Azil, NacinPodrske, RadniInterval } from '../../models/Azil';
import { MapaLokacije } from '../mapa-lokacije/mapa-lokacije';
import { prevediGresku } from '../../servisi/greske.util';
import { PrevediTekstPipe } from '../../pipes/prevedi-tekst.pipe';

@Component({
  selector: 'app-profil-azil',
  imports: [FormsModule, TranslatePipe, MapaLokacije, RouterLink, PrevediTekstPipe],
  templateUrl: './profil-azil.html',
  styleUrl: './profil-azil.css'
})
export class ProfilAzil implements OnInit {

  azil: Azil | null = null;

  naziv = '';
  email = '';
  telefon = '';
  adresa = '';
  lokacija = '';
  opis = '';
  oNama = '';
  trajanjeTermina = 30;

  nacinPodrske: NacinPodrske = {
    novcaneDonacije: false,
    brojRacuna: '',
    donacijaHrane: false,
    veterinarskaPomoc: false,
    ostalo: ''
  };

  radnoVreme: RadniInterval[] = [];

  ucitavanje = true;
  poruka = '';
  greska = false;
  ponovoPoslatoNaModeraciju = false;
  potrebnaPonovnaVerifikacija = false;
  potvrdaBrisanja = false;

  constructor(private servis: AzilService, private auth: AuthService, private router: Router, private translate: TranslateService) { }

  ngOnInit() {
    this.servis.profil().subscribe(azil => {
      this.azil = azil;
      this.naziv = azil.naziv;
      this.email = azil.email;
      this.telefon = azil.telefon;
      this.adresa = azil.adresa;
      this.lokacija = azil.lokacija;
      this.opis = azil.opis;
      this.oNama = azil.oNama;
      this.trajanjeTermina = azil.trajanjeTermina || 30;
      this.nacinPodrske = azil.nacinPodrske || this.nacinPodrske;
      this.radnoVreme = azil.radnoVreme || [];
      this.ucitavanje = false;
    });
  }

  dodajInterval() {
    this.radnoVreme.push({ dan: 1, odVremena: '09:00', doVremena: '17:00' });
  }

  ukloniInterval(i: number) {
    this.radnoVreme.splice(i, 1);
  }

  sacuvaj() {
    this.poruka = '';
    this.ponovoPoslatoNaModeraciju = false;
    this.potrebnaPonovnaVerifikacija = false;

    this.servis.azurirajProfil({
      naziv: this.naziv,
      email: this.email,
      telefon: this.telefon,
      adresa: this.adresa,
      lokacija: this.lokacija,
      opis: this.opis,
      oNama: this.oNama,
      nacinPodrske: this.nacinPodrske,
      radnoVreme: this.radnoVreme,
      trajanjeTermina: this.trajanjeTermina
    }).subscribe({
      next: (odgovor) => {
        this.greska = false;
        this.poruka = 'ok';
        this.ponovoPoslatoNaModeraciju = !!odgovor.ponovoPoslatoNaModeraciju;
        this.potrebnaPonovnaVerifikacija = odgovor.emailPotvrdjen === false;

        if (this.azil != null) {
          this.azil.status = odgovor.status;
          this.azil.razlogOdbijanja = undefined;
          this.azil.lat = odgovor.lat;
          this.azil.lng = odgovor.lng;
        }

        this.auth.azurirajKesiraniProfil({ status: odgovor.status, naziv: this.naziv, email: this.email });
      },
      error: (err) => {
        this.greska = true;
        this.poruka = prevediGresku(err, this.translate, 'Greška pri ažuriranju.');
      }
    });
  }

  obrisiNalog() {
    this.servis.obrisiNalog().subscribe(() => {
      this.auth.odjava();
      this.router.navigate(['/']);
    });
  }
}
