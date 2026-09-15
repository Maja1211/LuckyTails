import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthApiService } from '../../servisi/auth-api.service';
import { prevediGresku } from '../../servisi/greske.util';

@Component({
  selector: 'app-nova-lozinka',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './nova-lozinka.html',
  styleUrl: './nova-lozinka.css'
})
export class NovaLozinka implements OnInit {

  token: string | null = null;
  uloga: 'korisnik' | 'azil' | 'moderator' = 'korisnik';
  linkNevazeci = false;

  novaLozinka = '';
  uspesno = false;
  poruka = '';
  greska = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private servis: AuthApiService,
    private translate: TranslateService
  ) { }

  ngOnInit() {

    this.token = this.route.snapshot.queryParamMap.get('token');
    const uloga = this.route.snapshot.queryParamMap.get('uloga') as 'korisnik' | 'azil' | 'moderator';

    if (uloga != null) {
      this.uloga = uloga;
    }

    if (this.token == null) {
      this.linkNevazeci = true;
    }
  }

  postavi(f: NgForm) {

    if (f.invalid || this.token == null) {
      Object.values(f.controls).forEach(c => c.markAsTouched());
      return;
    }

    this.poruka = '';
    this.greska = false;

    this.servis.resetujLozinku(this.token, this.uloga, this.novaLozinka).subscribe({
      next: () => {
        this.uspesno = true;
      },
      error: (err) => {
        this.greska = true;
        if (err.error?.kod == 'RESET_LINK_NEVAZECI') {
          this.linkNevazeci = true;
        }
        this.poruka = prevediGresku(err, this.translate, 'Greška pri resetovanju lozinke.');
      }
    });
  }
}
