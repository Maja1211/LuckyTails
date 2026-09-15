import { Routes } from '@angular/router';
import { Pocetna } from './komponente/pocetna/pocetna';
import { Login } from './komponente/login/login';
import { Registracija } from './komponente/registracija/registracija';
import { RegistracijaKorisnik } from './komponente/registracija-korisnik/registracija-korisnik';
import { RegistracijaAzil } from './komponente/registracija-azil/registracija-azil';
import { VerifikacijaEmail } from './komponente/verifikacija-email/verifikacija-email';
import { ZaboravljenaLozinka } from './komponente/zaboravljena-lozinka/zaboravljena-lozinka';
import { NovaLozinka } from './komponente/nova-lozinka/nova-lozinka';
import { PretragaZivotinja } from './komponente/pretraga-zivotinja/pretraga-zivotinja';
import { DetaljiZivotinje } from './komponente/detalji-zivotinje/detalji-zivotinje';
import { Omiljene } from './komponente/omiljene/omiljene';
import { MojiTermini } from './komponente/moji-termini/moji-termini';
import { ProfilKorisnik } from './komponente/profil-korisnik/profil-korisnik';
import { ProfilAzil } from './komponente/profil-azil/profil-azil';
import { MojeObjave } from './komponente/moje-objave/moje-objave';
import { ZahteviTermina } from './komponente/zahtevi-termina/zahtevi-termina';
import { AdminPanel } from './komponente/admin-panel/admin-panel';
import { ModeratorLogin } from './komponente/moderator-login/moderator-login';
import { Faq } from './komponente/faq/faq';
import { AzilJavniProfil } from './komponente/azil-javni-profil/azil-javni-profil';
import { ListaAzila } from './komponente/lista-azila/lista-azila';
import { ulogaGuard, azilOdobrenGuard, gostGuard } from './guards/aut.guard';

export const routes: Routes = [
    { path: '', component: Pocetna },
    { path: 'login', component: Login, canActivate: [gostGuard()] },
    { path: 'registracija', component: Registracija, canActivate: [gostGuard()] },
    { path: 'registracija-korisnik', component: RegistracijaKorisnik, canActivate: [gostGuard()] },
    { path: 'registracija-azil', component: RegistracijaAzil, canActivate: [gostGuard()] },
    { path: 'verifikacija-email', component: VerifikacijaEmail },
    { path: 'zaboravljena-lozinka', component: ZaboravljenaLozinka, canActivate: [gostGuard()] },
    { path: 'nova-lozinka', component: NovaLozinka, canActivate: [gostGuard()] },
    { path: 'pretraga', component: PretragaZivotinja },
    { path: 'zivotinja/:id', component: DetaljiZivotinje },
    { path: 'azil/:id', component: AzilJavniProfil },
    { path: 'azili', component: ListaAzila },
    { path: 'faq', component: Faq },

    { path: 'omiljene', component: Omiljene, canActivate: [ulogaGuard('korisnik')] },
    { path: 'moji-termini', component: MojiTermini, canActivate: [ulogaGuard('korisnik')] },
    { path: 'profil', component: ProfilKorisnik, canActivate: [ulogaGuard('korisnik')] },

    { path: 'profil-azila', component: ProfilAzil, canActivate: [ulogaGuard('azil')] },
    { path: 'moje-objave', component: MojeObjave, canActivate: [azilOdobrenGuard()] },
    { path: 'zahtevi-termina', component: ZahteviTermina, canActivate: [azilOdobrenGuard()] },

    { path: 'moderator-prijava', component: ModeratorLogin, canActivate: [gostGuard()] },
    { path: 'admin', component: AdminPanel, canActivate: [ulogaGuard('moderator')] },

    { path: '**', redirectTo: '' }
];
