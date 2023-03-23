import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { VStepperComponent } from './v-stepper.component'

describe('VStepperComponent', () => {
  let component: VStepperComponent
  let fixture: ComponentFixture<VStepperComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [VStepperComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(VStepperComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
