import { TestBed, inject } from '@angular/core/testing';

import { CoinbigService } from './coinbig.service';

describe('CoinbigService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CoinbigService]
    });
  });

  it('should be created', inject([CoinbigService], (service: CoinbigService) => {
    expect(service).toBeTruthy();
  }));
});
