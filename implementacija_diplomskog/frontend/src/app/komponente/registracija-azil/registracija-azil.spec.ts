import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService } from '@ngx-translate/core';

import { RegistracijaAzil } from './registracija-azil';

describe('RegistracijaAzil', () => {
  let component: RegistracijaAzil;
  let fixture: ComponentFixture<RegistracijaAzil>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistracijaAzil],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), provideTranslateService()]
    }).compileComponents();

    fixture = TestBed.createComponent(RegistracijaAzil);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
