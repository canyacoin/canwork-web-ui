import { TestBed, inject } from '@angular/core/testing';

import { FeatureToggleService } from './feature-toggle.service';

describe('FeatureToggleService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FeatureToggleService]
    });
  });

  it('should be created', inject([FeatureToggleService], (service: FeatureToggleService) => {
    expect(service).toBeTruthy();
  }));
});
