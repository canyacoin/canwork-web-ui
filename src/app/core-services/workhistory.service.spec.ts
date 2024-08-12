import { TestBed } from '@angular/core/testing';

import { WorkhistoryService } from './workhistory.service';

describe('WorkhistoryService', () => {
  let service: WorkhistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkhistoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
