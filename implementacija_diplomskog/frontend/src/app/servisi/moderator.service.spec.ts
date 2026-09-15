import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ModeratorService } from './moderator.service';

describe('ModeratorService', () => {
  let service: ModeratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ModeratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
