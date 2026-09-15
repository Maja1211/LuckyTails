import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { StarostPipe } from '../../pipes/starost.pipe';
import { PrevediRasuPipe } from '../../pipes/prevedi-rasu.pipe';
import { ZivotinjaService } from '../../servisi/zivotinja.service';
import { AuthService } from '../../servisi/auth.service';
import { Zivotinja } from '../../models/Zivotinja';

@Component({
  selector: 'app-pocetna',
  imports: [RouterLink, TranslatePipe, StarostPipe, PrevediRasuPipe],
  templateUrl: './pocetna.html',
  styleUrl: './pocetna.css'
})
export class Pocetna implements OnInit {

  dostupne = 0;
  udomljene = 0;
  izdvojene: Zivotinja[] = [];

  constructor(private servis: ZivotinjaService, public auth: AuthService) { }

  ngOnInit() {

    this.servis.statistika().subscribe(rezultat => {
      this.dostupne = rezultat.dostupne;
      this.udomljene = rezultat.udomljene;
    });

    this.servis.izdvojene().subscribe(rezultat => {
      this.izdvojene = rezultat;
    });
  }

  slika(z: Zivotinja): string {
    if (z.fotografije != null && z.fotografije.length > 0) {
      return this.servis.slikaUrl(z.fotografije[0]);
    }
    return '/assets/img/plejsholder-zivotinja.svg';
  }
}
