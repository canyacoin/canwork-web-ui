import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { BscPaymentSelectorComponent } from './bsc-payment-selector.component'

describe('BscPaymentSelectorComponent', () => {
  let component: BscPaymentSelectorComponent
  let fixture: ComponentFixture<BscPaymentSelectorComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [BscPaymentSelectorComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BscPaymentSelectorComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
