import { TestBed } from '@angular/core/testing'

import { LimepayService } from './limepay.service'

describe('LimepayService', () => {
  beforeEach(() => TestBed.configureTestingModule({}))

  it('should be created', () => {
    const service: LimepayService = TestBed.get(LimepayService)
    expect(service).toBeTruthy()
  })
})
