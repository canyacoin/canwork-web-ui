import { TestBed, inject } from '@angular/core/testing';

import { CanpayService } from './canpay.service';

describe('CanpayService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CanpayService]
    });
  });

  it('should be created', inject([CanpayService], (service: CanpayService) => {
    expect(service).toBeTruthy();
  }));
});
