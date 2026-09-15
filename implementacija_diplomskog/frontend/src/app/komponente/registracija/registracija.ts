import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-registracija',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './registracija.html',
  styleUrl: './registracija.css'
})
export class Registracija { }
