import { TestBed, inject } from '@angular/core/testing';

import { MobileService } from './mobile.service';

describe('MobileService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MobileService]
    });
  });

  it('should be created', inject([MobileService], (service: MobileService) => {
    expect(service).toBeTruthy();
  }));
});
