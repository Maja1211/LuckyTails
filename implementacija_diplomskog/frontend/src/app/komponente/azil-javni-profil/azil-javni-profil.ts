import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AzilService } from '../../servisi/azil.service';
import { ZivotinjaService } from '../../servisi/zivotinja.service';
import { AuthService } from '../../servisi/auth.service';
import { prevediGresku } from '../../servisi/greske.util';
import { Azil } from '../../models/Azil';
import { Zivotinja } from '../../models/Zivotinja';
import { StarostPipe } from '../../pipes/starost.pipe';
import { PrevediTekstPipe } from '../../pipes/prevedi-tekst.pipe';
import { PrevediRasuPipe } from '../../pipes/prevedi-rasu.pipe';
import { MapaLokacije } from '../mapa-lokacije/mapa-lokacije';

@Component({
  selector: 'app-azil-javni-profil',
  imports: [RouterLink, FormsModule, TranslatePipe, StarostPipe, PrevediTekstPipe, PrevediRasuPipe, MapaLokacije],
  templateUrl: './azil-javni-profil.html',
  styleUrl: './azil-javni-profil.css'
})
export class AzilJavniProfil implements OnInit {

  azil: Azil | null = null;
  zivotinje: Zivotinja[] = [];
  ucitavanje = true;
  greska = false;

  mozeOceniti = false;
  vecOcenio = false;
  novaOcena = 5;
  noviTekst = '';
  porukaRecenzija = '';
  greskaRecenzija = false;

  constructor(
    private route: ActivatedRoute,
    private servis: AzilService,
    private zivotinjaServis: ZivotinjaService,
    public auth: AuthService,
    private translate: TranslateService
  ) { }

  ngOnInit() {

    const id = this.route.snapshot.paramMap.get('id')!;

    this.servis.javniProfil(id).subscribe({
      next: (azil) => {
        this.azil = azil;
        this.ucitavanje = false;
      },
      error: () => {
        this.greska = true;
        this.ucitavanje = false;
      }
    });

    this.zivotinjaServis.zaAzil(id).subscribe({
      next: (zivotinje) => this.zivotinje = zivotinje,
      error: () => this.zivotinje = []
    });

    if (this.auth.ulogovanUloga() == 'korisnik') {
      this.servis.mozeOceniti(id).subscribe({
        next: (odgovor) => {
          this.mozeOceniti = odgovor.mozeOceniti;
          this.vecOcenio = odgovor.vecOcenio;
        }
      });
    }
  }

  get prosecnaOcena(): number | null {
    const recenzije = this.azil?.recenzije || [];
    if (recenzije.length == 0) return null;
    return recenzije.reduce((zbir, r) => zbir + r.ocena, 0) / recenzije.length;
  }

  posaljiRecenziju() {

    this.porukaRecenzija = '';
    this.greskaRecenzija = false;

    if (!this.noviTekst.trim()) {
      this.greskaRecenzija = true;
      this.porukaRecenzija = 'Komentar ne može biti prazan.';
      return;
    }

    this.servis.dodajRecenziju(this.azil!._id, this.novaOcena, this.noviTekst).subscribe({
      next: () => {
        const profil = this.auth.ulogovanProfil();
        this.azil!.recenzije = [
          ...(this.azil!.recenzije || []),
          { korisnikId: profil?.id || '', ime: profil?.ime || '', prezime: profil?.prezime || '', ocena: this.novaOcena, tekst: this.noviTekst, datum: new Date().toISOString() }
        ];
        this.mozeOceniti = false;
        this.vecOcenio = true;
        this.noviTekst = '';
      },
      error: (err) => {
        this.greskaRecenzija = true;
        this.porukaRecenzija = prevediGresku(err, this.translate, 'Greška pri slanju recenzije.');
      }
    });
  }

  get aktivneZivotinje(): Zivotinja[] {
    return this.zivotinje.filter(z => z.statusZivotinje != 'udomljena');
  }

  get udomljeneZivotinje(): Zivotinja[] {
    return this.zivotinje.filter(z => z.statusZivotinje == 'udomljena');
  }

  slika(z: Zivotinja): string {
    if (z.fotografije != null && z.fotografije.length > 0) {
      return this.zivotinjaServis.slikaUrl(z.fotografije[0]);
    }
    return '/assets/img/plejsholder-zivotinja.svg';
  }
}
