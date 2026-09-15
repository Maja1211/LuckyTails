import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService } from '@ngx-translate/core';

import { ModeratorLogin } from './moderator-login';

describe('ModeratorLogin', () => {
  let component: ModeratorLogin;
  let fixture: ComponentFixture<ModeratorLogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModeratorLogin],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), provideTranslateService()]
    }).compileComponents();

    fixture = TestBed.createComponent(ModeratorLogin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
