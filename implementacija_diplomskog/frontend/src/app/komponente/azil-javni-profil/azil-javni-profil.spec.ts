import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService } from '@ngx-translate/core';

import { AzilJavniProfil } from './azil-javni-profil';

describe('AzilJavniProfil', () => {
  let component: AzilJavniProfil;
  let fixture: ComponentFixture<AzilJavniProfil>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AzilJavniProfil],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => 'test-id' } } }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AzilJavniProfil);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
