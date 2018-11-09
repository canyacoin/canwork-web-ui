import { TestBed, inject } from '@angular/core/testing';

import { PublicJobService } from './public-job.service';

describe('PublicJobService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PublicJobService]
    });
  });

  it('should be created', inject([PublicJobService], (service: PublicJobService) => {
    expect(service).toBeTruthy();
  }));
});
