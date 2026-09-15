import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService } from '@ngx-translate/core';

import { ProfilAzil } from './profil-azil';

describe('ProfilAzil', () => {
  let component: ProfilAzil;
  let fixture: ComponentFixture<ProfilAzil>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilAzil],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), provideTranslateService()]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilAzil);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
