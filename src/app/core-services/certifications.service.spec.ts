import { TestBed, inject } from '@angular/core/testing';

import { CertificationsService } from './certifications.service';

describe('CertificationsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CertificationsService]
    });
  });

  it('should be created', inject([CertificationsService], (service: CertificationsService) => {
    expect(service).toBeTruthy();
  }));
});
