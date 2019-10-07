import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { RandomAnimationComponent } from './random-animation.component'

describe('RandomAnimationComponent', () => {
  let component: RandomAnimationComponent
  let fixture: ComponentFixture<RandomAnimationComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RandomAnimationComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(RandomAnimationComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
