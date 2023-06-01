import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { EnterEscrowBscComponent } from './enter-escrow-bsc.component'

describe('EnterEscrowBscComponent', () => {
  let component: EnterEscrowBscComponent
  let fixture: ComponentFixture<EnterEscrowBscComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [EnterEscrowBscComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(EnterEscrowBscComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
