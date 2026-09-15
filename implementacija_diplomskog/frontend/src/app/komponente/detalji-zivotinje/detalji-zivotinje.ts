import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { StarostPipe } from '../../pipes/starost.pipe';
import { PrevediTekstPipe } from '../../pipes/prevedi-tekst.pipe';
import { PrevediRasuPipe } from '../../pipes/prevedi-rasu.pipe';
import { ZivotinjaService } from '../../servisi/zivotinja.service';
import { KorisnikService } from '../../servisi/korisnik.service';
import { TerminService } from '../../servisi/termin.service';
import { AuthService } from '../../servisi/auth.service';
import { Zivotinja } from '../../models/Zivotinja';
import { prevediGresku } from '../../servisi/greske.util';

@Component({
  selector: 'app-detalji-zivotinje',
  imports: [FormsModule, RouterLink, TranslatePipe, StarostPipe, PrevediTekstPipe, PrevediRasuPipe],
  templateUrl: './detalji-zivotinje.html',
  styleUrl: './detalji-zivotinje.css'
})
export class DetaljiZivotinje implements OnInit {

  zivotinja: Zivotinja | null = null;
  ucitavanje = true;

  izabranaSlika = '';

  jeOmiljena = false;

  datumTermina = '';
  slotovi: string[] = [];
  izabraniSlot = '';
  porukaTermina = '';
  ucitavanjeSlotova = false;
  terminZakazan = false;

  readonly danasIso = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  constructor(
    private route: ActivatedRoute,
    private zivotinjaServis: ZivotinjaService,
    private korisnikServis: KorisnikService,
    private terminServis: TerminService,
    public auth: AuthService,
    private translate: TranslateService
  ) { }

  ngOnInit() {

    const id = this.route.snapshot.paramMap.get('id')!;

    this.zivotinjaServis.detalji(id).subscribe({
      next: z => {
        this.zivotinja = z;
        this.izabranaSlika = z.fotografije.length > 0 ? z.fotografije[0] : '';
        this.ucitavanje = false;
      },
      error: () => {
        this.ucitavanje = false;
      }
    });

    if (this.auth.ulogovanUloga() == 'korisnik') {

      this.korisnikServis.omiljene().subscribe(omiljene => {
        this.jeOmiljena = omiljene.some((o: any) => o._id == id);
      });
    }
  }

  slika(putanja: string): string {
    return this.zivotinjaServis.slikaUrl(putanja);
  }

  izaberiSliku(putanja: string) {
    this.izabranaSlika = putanja;
  }

  prekidacOmiljene() {

    if (this.zivotinja == null) return;

    if (this.jeOmiljena) {
      this.korisnikServis.ukloniOmiljenu(this.zivotinja._id).subscribe(() => this.jeOmiljena = false);
    } else {
      this.korisnikServis.dodajOmiljenu(this.zivotinja._id).subscribe(() => this.jeOmiljena = true);
    }
  }

  ucitajSlotove() {

    if (this.zivotinja == null || !this.datumTermina) return;

    this.ucitavanjeSlotova = true;
    this.izabraniSlot = '';

    this.terminServis.slobodniSlotovi(this.zivotinja.azilId._id, this.datumTermina).subscribe(slotovi => {
      this.slotovi = slotovi;
      this.ucitavanjeSlotova = false;
    });
  }

  zakaziTermin() {

    if (this.zivotinja == null || !this.izabraniSlot) return;

    const datumVreme = `${this.datumTermina}T${this.izabraniSlot}:00`;

    this.terminServis.zakazi(this.zivotinja._id, datumVreme).subscribe({
      next: () => {
        this.terminZakazan = true;
      },
      error: (err) => {
        this.porukaTermina = prevediGresku(err, this.translate, 'Greška pri zakazivanju.');
      }
    });
  }
}
