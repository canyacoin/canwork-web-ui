import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { GetReferralComponent } from './get-referral.component'

describe('GetReferralComponent', () => {
  let component: GetReferralComponent
  let fixture: ComponentFixture<GetReferralComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [GetReferralComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(GetReferralComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
