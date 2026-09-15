import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService } from '@ngx-translate/core';

import { AdminPanel } from './admin-panel';

describe('AdminPanel', () => {
  let component: AdminPanel;
  let fixture: ComponentFixture<AdminPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPanel],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), provideTranslateService()]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
