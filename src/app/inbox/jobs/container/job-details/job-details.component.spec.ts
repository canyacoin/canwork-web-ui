import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { JobDetailsComponent } from './job-details.component'

describe('JobDetailsComponent', () => {
  let component: JobDetailsComponent
  let fixture: ComponentFixture<JobDetailsComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [JobDetailsComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(JobDetailsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
