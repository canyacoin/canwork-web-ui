import { TestBed, inject } from '@angular/core/testing';

import { DockIoService } from './dock-io.service';

describe('DockIoService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DockIoService]
    });
  });

  it('should be created', inject([DockIoService], (service: DockIoService) => {
    expect(service).toBeTruthy();
  }));
});
