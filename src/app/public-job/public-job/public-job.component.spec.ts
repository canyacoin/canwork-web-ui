import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { PublicJobComponent } from './public-job.component'

describe('PublicJobComponent', () => {
  let component: PublicJobComponent
  let fixture: ComponentFixture<PublicJobComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PublicJobComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicJobComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
