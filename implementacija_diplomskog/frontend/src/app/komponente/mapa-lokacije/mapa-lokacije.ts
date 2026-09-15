import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, ViewChild } from '@angular/core';
import * as L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'leaflet/marker-icon-2x.png',
  iconUrl: 'leaflet/marker-icon.png',
  shadowUrl: 'leaflet/marker-shadow.png'
});

@Component({
  selector: 'app-mapa-lokacije',
  standalone: true,
  template: `<div #mapaEl class="mapa-lokacije-el"></div>`,
  styles: [`
    .mapa-lokacije-el {
      width: 100%;
      height: 260px;
      border-radius: var(--radius);
      z-index: 0;
    }
  `]
})
export class MapaLokacije implements AfterViewInit, OnChanges, OnDestroy {

  @Input() lat: number | null = null;
  @Input() lng: number | null = null;
  @Input() naziv = '';

  @ViewChild('mapaEl', { static: true }) mapaEl!: ElementRef<HTMLDivElement>;

  private mapa: L.Map | null = null;
  private marker: L.Marker | null = null;

  ngAfterViewInit() {
    this.iniciralizuj();
  }

  ngOnChanges() {
    this.iniciralizuj();
  }

  private iniciralizuj() {

    if (this.lat == null || this.lng == null || !this.mapaEl) {
      return;
    }

    if (this.mapa == null) {

      this.mapa = L.map(this.mapaEl.nativeElement).setView([this.lat, this.lng], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
      }).addTo(this.mapa);

      this.marker = L.marker([this.lat, this.lng]).addTo(this.mapa);

      if (this.naziv) {
        this.marker.bindPopup(this.naziv);
      }

    } else {
      this.mapa.setView([this.lat, this.lng], 14);
      this.marker?.setLatLng([this.lat, this.lng]);
    }
  }

  ngOnDestroy() {
    this.mapa?.remove();
  }
}
