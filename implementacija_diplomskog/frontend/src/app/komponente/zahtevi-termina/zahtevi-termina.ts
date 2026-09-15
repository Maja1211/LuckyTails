import { Component, OnInit } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TerminService } from '../../servisi/termin.service';
import { ZivotinjaService } from '../../servisi/zivotinja.service';
import { TerminPosete } from '../../models/TerminPosete';
import { StarostPipe } from '../../pipes/starost.pipe';
import { PrevediRasuPipe } from '../../pipes/prevedi-rasu.pipe';
import { PrevediTekstPipe } from '../../pipes/prevedi-tekst.pipe';
import { prevediGresku } from '../../servisi/greske.util';

@Component({
  selector: 'app-zahtevi-termina',
  imports: [FormsModule, DatePipe, NgClass, TranslatePipe, StarostPipe, PrevediRasuPipe, PrevediTekstPipe],
  templateUrl: './zahtevi-termina.html',
  styleUrl: './zahtevi-termina.css'
})
export class ZahteviTermina implements OnInit {

  termini: TerminPosete[] = [];
  ucitavanje = true;
  smerSortiranja: 'asc' | 'desc' | null = null;

  idPredlaganja: string | null = null;
  noviDatum = '';
  noviSat = '';

  idOdbijanja: string | null = null;
  razlogOdbijanja = '';
  porukaOdbijanja = '';

  idOtkazivanja: string | null = null;
  razlogOtkazivanja = '';
  porukaOtkazivanja = '';

  readonly danasIso = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  porukaPredloga = '';
  poruka = '';

  constructor(private servis: TerminService, private zivotinjaServis: ZivotinjaService, private translate: TranslateService) { }

  ngOnInit() {
    this.ucitaj();
  }

  sortirajPoVremenu() {
    this.smerSortiranja = this.smerSortiranja == 'asc' ? 'desc' : 'asc';
    const smer = this.smerSortiranja;

    this.termini = [...this.termini].sort((a, b) => {
      const razlika = new Date(a.datumVreme).getTime() - new Date(b.datumVreme).getTime();
      return smer == 'asc' ? razlika : -razlika;
    });
  }

  slika(t: TerminPosete): string {
    const zivotinja = t.zivotinjaId as any;
    if (zivotinja?.fotografije != null && zivotinja.fotografije.length > 0) {
      return this.zivotinjaServis.slikaUrl(zivotinja.fotografije[0]);
    }
    return '/assets/img/plejsholder-zivotinja.svg';
  }

  ucitaj() {
    this.ucitavanje = true;
    this.servis.azila().subscribe({
      next: rezultat => {
        this.termini = rezultat;
        this.ucitavanje = false;
      },
      error: (err) => {
        this.poruka = prevediGresku(err, this.translate, 'Greška pri učitavanju zahteva.');
        this.ucitavanje = false;
      }
    });
  }

  odobri(id: string) {
    this.poruka = '';
    this.servis.obradi(id, 'odobren').subscribe({
      next: () => this.ucitaj(),
      error: (err) => this.poruka = prevediGresku(err, this.translate, 'Greška pri odobravanju termina.')
    });
  }

  otvoriOdbijanje(id: string) {
    this.idOdbijanja = id;
    this.razlogOdbijanja = '';
    this.porukaOdbijanja = '';
  }

  posaljiOdbijanje(id: string) {
    if (!this.razlogOdbijanja.trim()) return;

    this.porukaOdbijanja = '';

    this.servis.obradi(id, 'odbijen', undefined, this.razlogOdbijanja).subscribe({
      next: () => {
        this.idOdbijanja = null;
        this.ucitaj();
      },
      error: (err) => this.porukaOdbijanja = prevediGresku(err, this.translate, 'Greška pri odbijanju termina.')
    });
  }

  otvoriOtkazivanje(id: string) {
    this.idOtkazivanja = id;
    this.razlogOtkazivanja = '';
    this.porukaOtkazivanja = '';
  }

  posaljiOtkazivanje(id: string) {
    if (!this.razlogOtkazivanja.trim()) return;

    this.porukaOtkazivanja = '';

    this.servis.otkaziKaoAzil(id, this.razlogOtkazivanja).subscribe({
      next: () => {
        this.idOtkazivanja = null;
        this.ucitaj();
      },
      error: (err) => this.porukaOtkazivanja = prevediGresku(err, this.translate, 'Greška pri otkazivanju termina.')
    });
  }

  terminJeUBuducnosti(t: TerminPosete): boolean {
    return new Date(t.datumVreme) > new Date();
  }

  oznaciNepojavljivanje(id: string) {
    this.poruka = '';
    this.servis.oznaciNepojavljivanje(id).subscribe({
      next: () => this.ucitaj(),
      error: (err) => this.poruka = prevediGresku(err, this.translate, 'Greška pri označavanju nepojavljivanja.')
    });
  }

  otvoriPredlog(id: string) {
    this.idPredlaganja = id;
    this.noviDatum = '';
    this.noviSat = '';
    this.porukaPredloga = '';
  }

  posaljiPredlog(id: string) {
    if (!this.noviDatum || !this.noviSat) return;

    this.porukaPredloga = '';

    const predlozenoDatumVreme = `${this.noviDatum}T${this.noviSat}:00`;

    this.servis.obradi(id, 'predlozen_novi', predlozenoDatumVreme).subscribe({
      next: () => {
        this.idPredlaganja = null;
        this.ucitaj();
      },
      error: (err) => {
        this.porukaPredloga = prevediGresku(err, this.translate, 'Greška pri predlaganju termina.');
      }
    });
  }

  klasaOznake(status: string): string {
    if (status == 'odobren' || status == 'realizovan') return 'oznaka-odobreno';
    if (status == 'odbijen' || status == 'otkazan') return 'oznaka-odbijeno';
    if (status == 'predlozen_novi') return 'oznaka-na-cekanju';
    return 'oznaka-neutralno';
  }
}
