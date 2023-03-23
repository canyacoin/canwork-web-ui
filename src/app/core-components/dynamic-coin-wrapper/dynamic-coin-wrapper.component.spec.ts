import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { DynamicCoinWrapperComponent } from './dynamic-coin-wrapper.component'

describe('DynamicCoinWrapperComponent', () => {
  let component: DynamicCoinWrapperComponent
  let fixture: ComponentFixture<DynamicCoinWrapperComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DynamicCoinWrapperComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicCoinWrapperComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
