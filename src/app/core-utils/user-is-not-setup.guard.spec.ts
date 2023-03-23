import { TestBed, inject, waitForAsync } from '@angular/core/testing'

import { UserIsNotSetupGuard } from './user-is-not-setup.guard'

describe('UserIsNotSetupGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserIsNotSetupGuard],
    })
  })

  it('should ...', inject(
    [UserIsNotSetupGuard],
    (guard: UserIsNotSetupGuard) => {
      expect(guard).toBeTruthy()
    }
  ))
})
