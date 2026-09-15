import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AzilService } from '../../servisi/azil.service';
import { Azil } from '../../models/Azil';

@Component({
  selector: 'app-lista-azila',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './lista-azila.html',
  styleUrl: './lista-azila.css'
})
export class ListaAzila implements OnInit {

  azili: Azil[] = [];
  ucitavanje = true;

  constructor(private servis: AzilService) { }

  ngOnInit() {
    this.servis.svi().subscribe({
      next: rezultat => {
        this.azili = rezultat;
        this.ucitavanje = false;
      },
      error: () => {
        this.azili = [];
        this.ucitavanje = false;
      }
    });
  }
}
