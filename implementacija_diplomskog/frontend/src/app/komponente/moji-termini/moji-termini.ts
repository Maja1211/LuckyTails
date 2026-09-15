import { Component, OnInit } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TerminService } from '../../servisi/termin.service';
import { ZivotinjaService } from '../../servisi/zivotinja.service';
import { TerminPosete } from '../../models/TerminPosete';
import { StarostPipe } from '../../pipes/starost.pipe';
import { PrevediRasuPipe } from '../../pipes/prevedi-rasu.pipe';
import { PrevediTekstPipe } from '../../pipes/prevedi-tekst.pipe';
import { prevediGresku } from '../../servisi/greske.util';

@Component({
  selector: 'app-moji-termini',
  imports: [TranslatePipe, DatePipe, NgClass, StarostPipe, PrevediRasuPipe, PrevediTekstPipe],
  templateUrl: './moji-termini.html',
  styleUrl: './moji-termini.css'
})
export class MojiTermini implements OnInit {

  termini: TerminPosete[] = [];
  ucitavanje = true;
  poruka = '';
  smerSortiranja: 'asc' | 'desc' | null = null;

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
    this.servis.moji().subscribe({
      next: rezultat => {
        this.termini = rezultat;
        this.ucitavanje = false;
      },
      error: () => {
        this.ucitavanje = false;
      }
    });
  }

  odgovori(id: string, prihvata: boolean) {
    this.poruka = '';

    this.servis.odgovoriNaPredlog(id, prihvata).subscribe({
      next: () => this.ucitaj(),
      error: (err) => {
        this.poruka = prevediGresku(err, this.translate, 'Greška pri odgovoru na predloženi termin.');
        this.ucitaj();
      }
    });
  }

  otkazi(id: string) {
    this.poruka = '';
    this.servis.otkazi(id).subscribe({
      next: () => this.ucitaj(),
      error: (err) => this.poruka = prevediGresku(err, this.translate, 'Greška pri otkazivanju termina.')
    });
  }

  klasaOznake(status: string): string {
    if (status == 'odobren' || status == 'realizovan') return 'oznaka-odobreno';
    if (status == 'odbijen' || status == 'otkazan') return 'oznaka-odbijeno';
    if (status == 'predlozen_novi') return 'oznaka-na-cekanju';
    return 'oznaka-neutralno';
  }
}
