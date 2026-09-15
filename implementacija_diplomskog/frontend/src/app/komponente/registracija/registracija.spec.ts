import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';

import { Registracija } from './registracija';

describe('Registracija', () => {
  let component: Registracija;
  let fixture: ComponentFixture<Registracija>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Registracija],
      providers: [provideRouter([]), provideTranslateService()]
    }).compileComponents();

    fixture = TestBed.createComponent(Registracija);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
