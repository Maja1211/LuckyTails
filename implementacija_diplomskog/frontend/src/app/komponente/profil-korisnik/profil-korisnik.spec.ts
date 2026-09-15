import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService } from '@ngx-translate/core';

import { ProfilKorisnik } from './profil-korisnik';

describe('ProfilKorisnik', () => {
  let component: ProfilKorisnik;
  let fixture: ComponentFixture<ProfilKorisnik>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilKorisnik],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), provideTranslateService()]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilKorisnik);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
