import { TestBed, inject } from '@angular/core/testing';

import { AnimationsService } from './animations.service';

describe('AnimationsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AnimationsService]
    });
  });

  it('should be created', inject([AnimationsService], (service: AnimationsService) => {
    expect(service).toBeTruthy();
  }));
});
