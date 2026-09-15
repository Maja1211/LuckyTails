import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AzilService } from '../../servisi/azil.service';
import { prevediGresku } from '../../servisi/greske.util';

@Component({
  selector: 'app-registracija-azil',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './registracija-azil.html',
  styleUrl: './registracija-azil.css'
})
export class RegistracijaAzil {

  naziv = '';
  korisnickoIme = '';
  email = '';
  lozinka = '';
  telefon = '';
  adresa = '';
  lokacija = '';
  opis = '';

  poruka = '';
  greska = false;
  uspesno = false;

  constructor(private servis: AzilService, private translate: TranslateService) { }

  registruj(f: NgForm) {
    this.poruka = '';
    this.greska = false;

    if (f.invalid) {
      Object.values(f.controls).forEach(c => c.markAsTouched());
      this.greska = true;
      this.poruka = this.translate.instant('VALIDACIJA.ISPRAVITE_GRESKE');
      return;
    }

    this.servis.registracija({
      naziv: this.naziv,
      korisnickoIme: this.korisnickoIme,
      email: this.email,
      lozinka: this.lozinka,
      telefon: this.telefon,
      adresa: this.adresa,
      lokacija: this.lokacija,
      opis: this.opis
    }).subscribe({
      next: () => {
        this.uspesno = true;
      },
      error: (err) => {
        this.greska = true;
        this.poruka = prevediGresku(err, this.translate, 'Greška pri registraciji.');
      }
    });
  }
}
