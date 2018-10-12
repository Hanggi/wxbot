import { TestBed, inject } from '@angular/core/testing';

import { FcoinService } from './fcoin.service';

describe('FcoinService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FcoinService]
    });
  });

  it('should be created', inject([FcoinService], (service: FcoinService) => {
    expect(service).toBeTruthy();
  }));
});
