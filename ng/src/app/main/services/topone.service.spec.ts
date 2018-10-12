import { TestBed, inject } from '@angular/core/testing';

import { ToponeService } from './topone.service';

describe('ToponeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ToponeService]
    });
  });

  it('should be created', inject([ToponeService], (service: ToponeService) => {
    expect(service).toBeTruthy();
  }));
});
