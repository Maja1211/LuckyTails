import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ZivotinjaService } from '../../servisi/zivotinja.service';
import { AzilService } from '../../servisi/azil.service';
import { Zivotinja } from '../../models/Zivotinja';
import { StarostPipe } from '../../pipes/starost.pipe';
import { PrevediRasuPipe } from '../../pipes/prevedi-rasu.pipe';

@Component({
  selector: 'app-pretraga-zivotinja',
  imports: [FormsModule, RouterLink, TranslatePipe, StarostPipe, PrevediRasuPipe],
  templateUrl: './pretraga-zivotinja.html',
  styleUrl: './pretraga-zivotinja.css'
})
export class PretragaZivotinja implements OnInit {

  vrsta = '';
  rasa = '';
  sveRase: string[] = [];
  starostMin: number | null = null;
  starostMax: number | null = null;
  pol = '';
  sterilisan = '';
  lokacija = '';
  sveLokacije: string[] = [];

  zivotinje: Zivotinja[] = [];
  ucitavanje = true;

  constructor(private servis: ZivotinjaService, private azilServis: AzilService) { }

  ngOnInit() {
    this.pretrazi();
    this.servis.rase().subscribe({
      next: rezultat => this.sveRase = rezultat,
      error: () => this.sveRase = []
    });
    this.azilServis.svi().subscribe({
      next: azili => this.sveLokacije = [...new Set(azili.map(a => a.lokacija))].sort((a, b) => a.localeCompare(b, 'sr')),
      error: () => this.sveLokacije = []
    });
  }

  get starostOpsegNevazeci(): boolean {
    return this.starostMin != null && this.starostMax != null && this.starostMax < this.starostMin;
  }

  pretrazi() {
    if (this.starostOpsegNevazeci) return;

    this.ucitavanje = true;

    this.servis.pretraga({
      vrsta: this.vrsta || undefined,
      rasa: this.rasa || undefined,
      starostMin: this.starostMin ?? undefined,
      starostMax: this.starostMax ?? undefined,
      pol: this.pol || undefined,
      sterilisan: this.sterilisan || undefined,
      lokacija: this.lokacija || undefined
    }).subscribe({
      next: rezultat => {
        this.zivotinje = rezultat;
        this.ucitavanje = false;
      },
      error: () => {
        this.zivotinje = [];
        this.ucitavanje = false;
      }
    });
  }

  slika(z: Zivotinja): string {
    if (z.fotografije != null && z.fotografije.length > 0) {
      return this.servis.slikaUrl(z.fotografije[0]);
    }
    return '/assets/img/plejsholder-zivotinja.svg';
  }
}
