import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService } from '@ngx-translate/core';

import { PretragaZivotinja } from './pretraga-zivotinja';

describe('PretragaZivotinja', () => {
  let component: PretragaZivotinja;
  let fixture: ComponentFixture<PretragaZivotinja>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PretragaZivotinja],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), provideTranslateService()]
    }).compileComponents();

    fixture = TestBed.createComponent(PretragaZivotinja);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
