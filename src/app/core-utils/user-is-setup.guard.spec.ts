import { TestBed, async, inject } from '@angular/core/testing';

import { UserIsSetupGuard } from './user-is-setup.guard';

describe('UserIsSetupGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserIsSetupGuard]
    });
  });

  it('should ...', inject([UserIsSetupGuard], (guard: UserIsSetupGuard) => {
    expect(guard).toBeTruthy();
  }));
});
