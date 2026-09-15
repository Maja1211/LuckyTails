import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService, Uloga } from '../../servisi/auth.service';
import { prevediGresku } from '../../servisi/greske.util';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  uloga: Uloga = 'korisnik';
  korisnickoIme = '';
  lozinka = '';
  poruka = '';
  greska = false;

  constructor(private auth: AuthService, private router: Router, private translate: TranslateService) { }

  prijaviSe() {
    this.poruka = '';
    this.greska = false;

    this.auth.login(this.korisnickoIme, this.lozinka, this.uloga).subscribe({
      next: (odgovor) => {

        if (this.uloga == 'korisnik') {
          this.router.navigate(['/pretraga'], { replaceUrl: true });
        } else if (this.uloga == 'azil') {
          if (odgovor.profil.status == 'odobren') this.router.navigate(['/moje-objave'], { replaceUrl: true });
          else this.router.navigate(['/profil-azila'], { replaceUrl: true });
        } else {
          this.router.navigate(['/admin'], { replaceUrl: true });
        }
      },
      error: (err) => {
        this.greska = true;
        this.poruka = prevediGresku(err, this.translate, 'Greška pri prijavi.');
      }
    });
  }
}
