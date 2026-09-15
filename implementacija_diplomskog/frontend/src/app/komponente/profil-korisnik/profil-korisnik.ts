import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { KorisnikService } from '../../servisi/korisnik.service';
import { AuthService } from '../../servisi/auth.service';
import { Formular } from '../../models/Korisnik';
import { prevediGresku } from '../../servisi/greske.util';

@Component({
  selector: 'app-profil-korisnik',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './profil-korisnik.html',
  styleUrl: './profil-korisnik.css'
})
export class ProfilKorisnik implements OnInit {

  ime = '';
  prezime = '';
  email = '';

  formular: Formular = {
    tipStambenogProstora: '',
    imaDrugeZivotinje: false,
    brojDrugihZivotinja: undefined,
    vrstaDrugihZivotinja: '',
    iskustvo: '',
    svrhaUdomljavanja: 'Kućni ljubimac',
    svrhaUdomljavanjaOpis: '',
    ostaloRelevantno: ''
  };

  ucitavanje = true;
  poruka = '';
  greska = false;
  potrebnaPonovnaVerifikacija = false;

  constructor(private servis: KorisnikService, private auth: AuthService, private router: Router, private translate: TranslateService) { }

  ngOnInit() {
    this.servis.profil().subscribe(profil => {
      this.ime = profil.ime;
      this.prezime = profil.prezime;
      this.email = profil.email;
      this.formular = profil.formular || this.formular;
      this.ucitavanje = false;
    });
  }

  sacuvaj() {
    this.poruka = '';
    this.potrebnaPonovnaVerifikacija = false;

    this.servis.azurirajProfil({
      ime: this.ime,
      prezime: this.prezime,
      email: this.email,
      formular: this.formular
    }).subscribe({
      next: (odgovor) => {
        this.greska = false;
        this.poruka = 'ok';
        this.potrebnaPonovnaVerifikacija = odgovor.emailPotvrdjen === false;
        this.auth.azurirajKesiraniProfil({ ime: this.ime, prezime: this.prezime, email: this.email });
      },
      error: (err) => {
        this.greska = true;
        this.poruka = prevediGresku(err, this.translate, 'Greška pri ažuriranju.');
      }
    });
  }

  potvrdaBrisanja = false;

  obrisiNalog() {
    this.servis.obrisiNalog().subscribe(() => {
      this.auth.odjava();
      this.router.navigate(['/']);
    });
  }
}
