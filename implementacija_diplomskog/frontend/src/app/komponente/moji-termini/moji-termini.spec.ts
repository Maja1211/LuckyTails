import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService } from '@ngx-translate/core';

import { MojiTermini } from './moji-termini';

describe('MojiTermini', () => {
  let component: MojiTermini;
  let fixture: ComponentFixture<MojiTermini>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MojiTermini],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), provideTranslateService()]
    }).compileComponents();

    fixture = TestBed.createComponent(MojiTermini);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
