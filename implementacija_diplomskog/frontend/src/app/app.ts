import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { AuthService } from './servisi/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, TranslatePipe],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  constructor(
    public auth: AuthService,
    private translate: TranslateService,
    private router: Router
  ) { }

  promeniJezik(jezik: string) {
    this.translate.use(jezik);
    localStorage.setItem('luckytails_jezik', jezik);
  }

  trenutniJezik(): string {
    return this.translate.getCurrentLang() || 'sr';
  }

  odjava() {
    this.auth.odjava();
    this.router.navigate(['/']);
  }

  private pocetneStraniceUloga = ['/pretraga', '/moje-objave', '/profil-azila', '/admin'];

  prikaziNazad(): boolean {
    if (this.router.url === '/') return false;
    return !this.pocetneStraniceUloga.some(putanja => this.router.url === putanja || this.router.url.startsWith(putanja + '?'));
  }

  nazad() {
    window.history.back();
  }
}
