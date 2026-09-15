import { Component, OnInit } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ZivotinjaService } from '../../servisi/zivotinja.service';
import { Zivotinja } from '../../models/Zivotinja';
import { StarostPipe } from '../../pipes/starost.pipe';
import { PrevediRasuPipe } from '../../pipes/prevedi-rasu.pipe';
import { PrevediTekstPipe } from '../../pipes/prevedi-tekst.pipe';
import { prevediGresku } from '../../servisi/greske.util';

@Component({
  selector: 'app-moje-objave',
  imports: [FormsModule, TranslatePipe, NgTemplateOutlet, StarostPipe, PrevediRasuPipe, PrevediTekstPipe],
  templateUrl: './moje-objave.html',
  styleUrl: './moje-objave.css'
})
export class MojeObjave implements OnInit {

  zivotinje: Zivotinja[] = [];
  ucitavanje = true;

  prikaziFormu = false;
  idUizmjeni: string | null = null;

  naziv = '';
  vrsta = 'pas';
  rasa = '';
  unosNoveRase = false;
  sveRase: string[] = [];
  starostGodine: number | null = null;
  starostDodatniMeseci: number | null = null;
  pol = 'muzjak';
  opisKaraktera = '';
  sterilisan = false;
  vakcinisan = false;
  zdravstveneInfo = '';
  fotografije: File[] = [];

  poruka = '';
  greska = false;

  constructor(private servis: ZivotinjaService, private translate: TranslateService) { }

  ngOnInit() {
    this.ucitaj();
    this.servis.rase().subscribe({
      next: rezultat => this.sveRase = rezultat,
      error: () => this.sveRase = []
    });
  }

  ucitaj() {
    this.ucitavanje = true;
    this.servis.mojeZivotinje().subscribe({
      next: rezultat => {
        this.zivotinje = rezultat;
        this.ucitavanje = false;
      },
      error: () => {
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

  novaObjava() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.idUizmjeni = null;
    this.naziv = '';
    this.vrsta = 'pas';
    this.rasa = '';
    this.unosNoveRase = false;
    this.starostGodine = null;
    this.starostDodatniMeseci = null;
    this.pol = 'muzjak';
    this.opisKaraktera = '';
    this.sterilisan = false;
    this.vakcinisan = false;
    this.zdravstveneInfo = '';
    this.fotografije = [];
    this.poruka = '';
    this.prikaziFormu = true;
  }

  izmeni(z: Zivotinja) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.idUizmjeni = z._id;
    this.naziv = z.naziv;
    this.vrsta = z.vrsta;
    this.rasa = z.rasa;
    this.unosNoveRase = !this.sveRase.includes(z.rasa);
    this.starostGodine = Math.floor(z.starostMeseci / 12);
    this.starostDodatniMeseci = this.starostGodine == 0 ? z.starostMeseci % 12 : null;
    this.pol = z.pol;
    this.opisKaraktera = z.opisKaraktera;
    this.sterilisan = z.sterilisan;
    this.vakcinisan = z.vakcinisan;
    this.zdravstveneInfo = z.zdravstveneInfo;
    this.fotografije = [];
    this.poruka = '';
    this.prikaziFormu = true;
  }

  odaberiRasu(vrednost: string) {
    if (vrednost == '__nova__') {
      this.unosNoveRase = true;
      this.rasa = '';
    } else {
      this.unosNoveRase = false;
      this.rasa = vrednost;
    }
  }

  get starostUkupnoMeseci(): number | null {
    if (this.starostGodine == null) return null;
    if (this.starostGodine > 0) return this.starostGodine * 12;
    return this.starostDodatniMeseci;
  }

  private proveriDimenzije(fajl: File): Promise<{ sirina: number, visina: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ sirina: img.width, visina: img.height });
      img.onerror = () => reject();
      img.src = URL.createObjectURL(fajl);
    });
  }

  async odaberiFajlove(event: Event) {
    const input = event.target as HTMLInputElement;
    const izabrani = input.files ? Array.from(input.files) : [];

    if (izabrani.length == 0) {
      this.fotografije = [];
      return;
    }

    if (izabrani.length > 3) {
      this.greska = true;
      this.poruka = this.translate.instant('OBJAVE.LIMIT_FOTOGRAFIJA', { broj: izabrani.length });
      this.fotografije = [];
      input.value = '';
      return;
    }

    for (const fajl of izabrani) {
      const { sirina, visina } = await this.proveriDimenzije(fajl);

      if (sirina < 200 || visina < 200 || sirina > 4000 || visina > 4000) {
        this.greska = true;
        this.poruka = this.translate.instant('OBJAVE.DIMENZIJE_NEISPRAVNE', { naziv: fajl.name, sirina, visina });
        this.fotografije = [];
        input.value = '';
        return;
      }
    }

    this.greska = false;
    this.poruka = '';
    this.fotografije = izabrani;
  }

  sacuvaj() {

    const formData = new FormData();
    formData.append('naziv', this.naziv);
    formData.append('vrsta', this.vrsta);
    formData.append('rasa', this.rasa);
    formData.append('starostMeseci', String(this.starostUkupnoMeseci ?? ''));
    formData.append('pol', this.pol);
    formData.append('opisKaraktera', this.opisKaraktera);
    formData.append('sterilisan', String(this.sterilisan));
    formData.append('vakcinisan', String(this.vakcinisan));
    formData.append('zdravstveneInfo', this.zdravstveneInfo);

    this.fotografije.forEach(f => formData.append('fotografije', f));

    const zahtev = this.idUizmjeni != null
      ? this.servis.azuriraj(this.idUizmjeni, formData)
      : this.servis.dodaj(formData);

    zahtev.subscribe({
      next: () => {
        this.prikaziFormu = false;
        this.ucitaj();
      },
      error: (err) => {
        this.greska = true;
        this.poruka = prevediGresku(err, this.translate, 'Greška pri čuvanju objave.');
      }
    });
  }

  get nedostajeFotografija(): boolean {
    return this.idUizmjeni == null && this.fotografije.length == 0;
  }

  obrisi(id: string) {
    this.poruka = '';
    this.servis.obrisi(id).subscribe({
      next: () => this.ucitaj(),
      error: (err) => { this.greska = true; this.poruka = prevediGresku(err, this.translate, 'Greška pri brisanju objave.'); }
    });
  }

  promeniStatus(z: Zivotinja, status: string) {
    this.poruka = '';
    this.servis.promeniStatus(z._id, status).subscribe({
      next: () => this.ucitaj(),
      error: (err) => { this.greska = true; this.poruka = prevediGresku(err, this.translate, 'Greška pri promeni statusa.'); }
    });
  }

  klasaOznake(status: string): string {
    if (status == 'odobrena') return 'oznaka-odobreno';
    if (status == 'odbijena') return 'oznaka-odbijeno';
    return 'oznaka-na-cekanju';
  }

  get aktivneZivotinje(): Zivotinja[] {
    return this.zivotinje.filter(z => z.statusZivotinje != 'udomljena');
  }

  get udomljeneZivotinje(): Zivotinja[] {
    return this.zivotinje.filter(z => z.statusZivotinje == 'udomljena');
  }
}
