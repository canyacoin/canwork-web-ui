import { TestBed } from '@angular/core/testing';

import { BscService } from './bsc.service';

describe('BscService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BscService = TestBed.get(BscService);
    expect(service).toBeTruthy();
  });
});
