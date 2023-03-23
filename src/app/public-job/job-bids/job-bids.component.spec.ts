import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { JobBidsComponent } from './job-bids.component'

describe('JobBidsComponent', () => {
  let component: JobBidsComponent
  let fixture: ComponentFixture<JobBidsComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [JobBidsComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(JobBidsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
