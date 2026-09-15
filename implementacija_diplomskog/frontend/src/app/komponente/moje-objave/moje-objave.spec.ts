import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService } from '@ngx-translate/core';

import { MojeObjave } from './moje-objave';

describe('MojeObjave', () => {
  let component: MojeObjave;
  let fixture: ComponentFixture<MojeObjave>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MojeObjave],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), provideTranslateService()]
    }).compileComponents();

    fixture = TestBed.createComponent(MojeObjave);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
