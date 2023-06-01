import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { DynamicCoinComponent } from './dynamic-coin.component'

describe('DynamicCoinComponent', () => {
  let component: DynamicCoinComponent
  let fixture: ComponentFixture<DynamicCoinComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DynamicCoinComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicCoinComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
