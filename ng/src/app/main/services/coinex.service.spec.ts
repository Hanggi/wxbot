import { TestBed, inject } from '@angular/core/testing';

import { CoinexService } from './coinex.service';

describe('CoinexService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CoinexService]
    });
  });

  it('should be created', inject([CoinexService], (service: CoinexService) => {
    expect(service).toBeTruthy();
  }));
});
