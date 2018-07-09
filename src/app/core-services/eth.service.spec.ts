import { inject, TestBed } from '@angular/core/testing';

import { CanWorkEthService } from './eth.service';

describe('EthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CanWorkEthService]
    });
  });

  it('should be created', inject([CanWorkEthService], (service: CanWorkEthService) => {
    expect(service).toBeTruthy();
  }));
});
