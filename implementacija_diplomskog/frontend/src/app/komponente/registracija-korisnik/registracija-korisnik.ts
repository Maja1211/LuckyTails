import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { KorisnikService } from '../../servisi/korisnik.service';
import { prevediGresku } from '../../servisi/greske.util';

@Component({
  selector: 'app-registracija-korisnik',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './registracija-korisnik.html',
  styleUrl: './registracija-korisnik.css'
})
export class RegistracijaKorisnik {

  ime = '';
  prezime = '';
  korisnickoIme = '';
  email = '';
  lozinka = '';

  poruka = '';
  greska = false;
  uspesno = false;

  constructor(private servis: KorisnikService, private translate: TranslateService) { }

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
      ime: this.ime,
      prezime: this.prezime,
      korisnickoIme: this.korisnickoIme,
      email: this.email,
      lozinka: this.lozinka
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
