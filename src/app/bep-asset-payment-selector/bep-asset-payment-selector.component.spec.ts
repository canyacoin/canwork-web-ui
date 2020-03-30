import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { BepAssetPaymentSelectorComponent } from './bep-asset-payment-selector.component'

describe('BepAssetPaymentSelectorComponent', () => {
  let component: BepAssetPaymentSelectorComponent
  let fixture: ComponentFixture<BepAssetPaymentSelectorComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BepAssetPaymentSelectorComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BepAssetPaymentSelectorComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
