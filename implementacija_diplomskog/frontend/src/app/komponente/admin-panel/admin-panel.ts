import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { StarostPipe } from '../../pipes/starost.pipe';
import { PrevediRasuPipe } from '../../pipes/prevedi-rasu.pipe';
import { PrevediTekstPipe } from '../../pipes/prevedi-tekst.pipe';
import { ModeratorService } from '../../servisi/moderator.service';
import { ZivotinjaService } from '../../servisi/zivotinja.service';
import { MapaLokacije } from '../mapa-lokacije/mapa-lokacije';
import { prevediGresku } from '../../servisi/greske.util';

@Component({
  selector: 'app-admin-panel',
  imports: [FormsModule, TranslatePipe, StarostPipe, PrevediRasuPipe, PrevediTekstPipe, DatePipe, MapaLokacije],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.css'
})
export class AdminPanel implements OnInit {

  zahteviAzila: any[] = [];
  objaveNaCekanju: any[] = [];
  statistika: any = null;
  ucitavanje = true;

  idOdbijanjaAzila: string | null = null;
  idOdbijanjaObjave: string | null = null;
  razlog = '';
  poruka = '';

  constructor(private servis: ModeratorService, public zivotinjaServis: ZivotinjaService, private translate: TranslateService) { }

  ngOnInit() {
    this.ucitaj();
  }

  ucitaj() {
    this.ucitavanje = true;

    this.servis.zahteviRegistracijeAzila().subscribe({
      next: rezultat => {
        this.zahteviAzila = rezultat;
        this.ucitavanje = false;
      },
      error: (err) => {
        this.poruka = prevediGresku(err, this.translate, 'Greška pri učitavanju zahteva.');
        this.ucitavanje = false;
      }
    });

    this.servis.objaveNaCekanju().subscribe({
      next: rezultat => this.objaveNaCekanju = rezultat,
      error: (err) => this.poruka = prevediGresku(err, this.translate, 'Greška pri učitavanju objava.')
    });

    this.servis.statistike().subscribe({
      next: rezultat => this.statistika = rezultat,
      error: (err) => this.poruka = prevediGresku(err, this.translate, 'Greška pri učitavanju statistike.')
    });
  }

  odobriAzil(id: string) {
    this.poruka = '';
    this.servis.obradiRegistracijuAzila(id, 'odobren').subscribe({
      next: () => this.ucitaj(),
      error: (err) => this.poruka = prevediGresku(err, this.translate, 'Greška pri odobravanju azila.')
    });
  }

  otvoriOdbijanjeAzila(id: string) {
    this.idOdbijanjaAzila = id;
    this.razlog = '';
  }

  odbijAzil(id: string) {
    this.poruka = '';
    this.servis.obradiRegistracijuAzila(id, 'odbijen', this.razlog).subscribe({
      next: () => {
        this.idOdbijanjaAzila = null;
        this.ucitaj();
      },
      error: (err) => this.poruka = prevediGresku(err, this.translate, 'Greška pri odbijanju azila.')
    });
  }

  odobriObjavu(id: string) {
    this.poruka = '';
    this.servis.obradiObjavu(id, 'odobrena').subscribe({
      next: () => this.ucitaj(),
      error: (err) => this.poruka = prevediGresku(err, this.translate, 'Greška pri odobravanju objave.')
    });
  }

  otvoriOdbijanjeObjave(id: string) {
    this.idOdbijanjaObjave = id;
    this.razlog = '';
  }

  odbijObjavu(id: string) {
    this.poruka = '';
    this.servis.obradiObjavu(id, 'odbijena', this.razlog).subscribe({
      next: () => {
        this.idOdbijanjaObjave = null;
        this.ucitaj();
      },
      error: (err) => this.poruka = prevediGresku(err, this.translate, 'Greška pri odbijanju objave.')
    });
  }

  slika(z: any): string {
    if (z.fotografije != null && z.fotografije.length > 0) {
      return this.zivotinjaServis.slikaUrl(z.fotografije[0]);
    }
    return '/assets/img/plejsholder-zivotinja.svg';
  }
}
