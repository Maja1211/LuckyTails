import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../servisi/auth.service';
import { prevediGresku } from '../../servisi/greske.util';

@Component({
  selector: 'app-moderator-login',
  imports: [FormsModule, TranslatePipe, RouterLink],
  templateUrl: './moderator-login.html',
  styleUrl: './moderator-login.css'
})
export class ModeratorLogin {

  korisnickoIme = '';
  lozinka = '';
  poruka = '';
  greska = false;

  constructor(private auth: AuthService, private router: Router, private translate: TranslateService) { }

  prijaviSe() {
    this.poruka = '';
    this.greska = false;

    this.auth.login(this.korisnickoIme, this.lozinka, 'moderator').subscribe({
      next: () => {
        this.router.navigate(['/admin'], { replaceUrl: true });
      },
      error: (err) => {
        this.greska = true;
        this.poruka = prevediGresku(err, this.translate, 'Greška pri prijavi.');
      }
    });
  }
}
