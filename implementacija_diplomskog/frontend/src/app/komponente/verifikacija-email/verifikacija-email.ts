import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthApiService } from '../../servisi/auth-api.service';

@Component({
  selector: 'app-verifikacija-email',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './verifikacija-email.html',
  styleUrl: './verifikacija-email.css'
})
export class VerifikacijaEmail implements OnInit {

  ucitavanje = true;
  uspesno = false;
  uloga: 'korisnik' | 'azil' = 'korisnik';

  emailPonovnoSlanje = '';
  ponovnoSlanjePoslato = false;

  constructor(private route: ActivatedRoute, private servis: AuthApiService) { }

  ngOnInit() {

    const token = this.route.snapshot.queryParamMap.get('token');
    const uloga = this.route.snapshot.queryParamMap.get('uloga') as 'korisnik' | 'azil';

    if (uloga != null) {
      this.uloga = uloga;
    }

    if (token == null || uloga == null) {
      this.ucitavanje = false;
      return;
    }

    this.servis.verifikujEmail(token, uloga).subscribe({
      next: () => {
        this.uspesno = true;
        this.ucitavanje = false;
      },
      error: () => {
        this.uspesno = false;
        this.ucitavanje = false;
      }
    });
  }

  posaljiPonovo() {

    if (!this.emailPonovnoSlanje) return;

    this.servis.ponovoPosaljiVerifikaciju(this.emailPonovnoSlanje, this.uloga).subscribe(() => {
      this.ponovnoSlanjePoslato = true;
    });
  }
}
