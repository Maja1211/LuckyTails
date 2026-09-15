import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthApiService } from '../../servisi/auth-api.service';

@Component({
  selector: 'app-zaboravljena-lozinka',
  imports: [FormsModule, RouterLink, TranslatePipe],
  templateUrl: './zaboravljena-lozinka.html',
  styleUrl: './zaboravljena-lozinka.css'
})
export class ZaboravljenaLozinka {

  email = '';
  poslato = false;

  constructor(private servis: AuthApiService) { }

  posalji() {
    if (!this.email) return;

    this.servis.zaboravljenaLozinka(this.email).subscribe(() => {
      this.poslato = true;
    });
  }
}
