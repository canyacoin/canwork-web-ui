import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { DynamicCoinWrapperComponent } from './dynamic-coin-wrapper.component'

describe('DynamicCoinWrapperComponent', () => {
  let component: DynamicCoinWrapperComponent
  let fixture: ComponentFixture<DynamicCoinWrapperComponent>

  beforeEach(async(() => {
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
