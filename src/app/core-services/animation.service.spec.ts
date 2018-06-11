import { TestBed, inject } from '@angular/core/testing';

import { AnimationService } from './animation.service';

describe('AnimationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AnimationService]
    });
  });

  it('should be created', inject([AnimationService], (service: AnimationService) => {
    expect(service).toBeTruthy();
  }));
});
