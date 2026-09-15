import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { TerminService } from './termin.service';

describe('TerminService', () => {
  let service: TerminService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(TerminService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
