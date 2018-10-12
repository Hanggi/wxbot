import { TestBed, inject } from '@angular/core/testing';

import { XocxService } from './xocx.service';

describe('XocxService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [XocxService]
    });
  });

  it('should be created', inject([XocxService], (service: XocxService) => {
    expect(service).toBeTruthy();
  }));
});
