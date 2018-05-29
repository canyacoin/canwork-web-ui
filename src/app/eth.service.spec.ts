import { TestBed, inject } from '@angular/core/testing';

import { EthService } from './eth.service';

describe('EthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EthService]
    });
  });

  it('should be created', inject([EthService], (service: EthService) => {
    expect(service).toBeTruthy();
  }));
});
