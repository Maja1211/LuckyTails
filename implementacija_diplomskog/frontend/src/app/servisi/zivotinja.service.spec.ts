import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ZivotinjaService } from './zivotinja.service';

describe('ZivotinjaService', () => {
  let service: ZivotinjaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ZivotinjaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
