import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService } from '@ngx-translate/core';

import { DetaljiZivotinje } from './detalji-zivotinje';

describe('DetaljiZivotinje', () => {
  let component: DetaljiZivotinje;
  let fixture: ComponentFixture<DetaljiZivotinje>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetaljiZivotinje],
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

    fixture = TestBed.createComponent(DetaljiZivotinje);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
