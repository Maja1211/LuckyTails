import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { PrevediRasuPipe } from '../../pipes/prevedi-rasu.pipe';
import { KorisnikService } from '../../servisi/korisnik.service';
import { ZivotinjaService } from '../../servisi/zivotinja.service';

@Component({
  selector: 'app-omiljene',
  imports: [RouterLink, TranslatePipe, PrevediRasuPipe],
  templateUrl: './omiljene.html',
  styleUrl: './omiljene.css'
})
export class Omiljene implements OnInit {

  omiljene: any[] = [];
  ucitavanje = true;

  constructor(private servis: KorisnikService, public zivotinjaServis: ZivotinjaService) { }

  ngOnInit() {
    this.ucitaj();
  }

  ucitaj() {
    this.ucitavanje = true;
    this.servis.omiljene().subscribe({
      next: rezultat => {
        this.omiljene = rezultat;
        this.ucitavanje = false;
      },
      error: () => {
        this.ucitavanje = false;
      }
    });
  }

  ukloni(id: string) {
    this.servis.ukloniOmiljenu(id).subscribe(() => this.ucitaj());
  }

  slika(z: any): string {
    if (z.fotografije != null && z.fotografije.length > 0) {
      return this.zivotinjaServis.slikaUrl(z.fotografije[0]);
    }
    return '/assets/img/plejsholder-zivotinja.svg';
  }
}
