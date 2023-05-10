import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { CanpayWizardComponent } from './canpay-wizard.component'

describe('CanpayWizardComponent', () => {
  let component: CanpayWizardComponent
  let fixture: ComponentFixture<CanpayWizardComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CanpayWizardComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CanpayWizardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
