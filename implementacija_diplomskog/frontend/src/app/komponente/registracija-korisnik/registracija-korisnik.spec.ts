import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService } from '@ngx-translate/core';

import { RegistracijaKorisnik } from './registracija-korisnik';

describe('RegistracijaKorisnik', () => {
  let component: RegistracijaKorisnik;
  let fixture: ComponentFixture<RegistracijaKorisnik>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistracijaKorisnik],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), provideTranslateService()]
    }).compileComponents();

    fixture = TestBed.createComponent(RegistracijaKorisnik);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
