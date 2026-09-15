import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService } from '@ngx-translate/core';

import { ZahteviTermina } from './zahtevi-termina';

describe('ZahteviTermina', () => {
  let component: ZahteviTermina;
  let fixture: ComponentFixture<ZahteviTermina>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZahteviTermina],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), provideTranslateService()]
    }).compileComponents();

    fixture = TestBed.createComponent(ZahteviTermina);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
