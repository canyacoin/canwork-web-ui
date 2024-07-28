import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { BuyCoffeeComponent } from './buy-coffee.component'

describe('BuyCoffeeComponent', () => {
  let component: BuyCoffeeComponent
  let fixture: ComponentFixture<BuyCoffeeComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [BuyCoffeeComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BuyCoffeeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
