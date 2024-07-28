import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { ReviewsComponent } from './reviews.component'

describe('ReviewsComponent', () => {
  let component: ReviewsComponent
  let fixture: ComponentFixture<ReviewsComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ReviewsComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
