import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { AzilService } from './azil.service';

describe('AzilService', () => {
  let service: AzilService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AzilService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
