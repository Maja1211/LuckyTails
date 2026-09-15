import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { KorisnikService } from './korisnik.service';

describe('KorisnikService', () => {
  let service: KorisnikService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(KorisnikService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
