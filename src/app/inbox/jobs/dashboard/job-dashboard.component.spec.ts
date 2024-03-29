import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { JobDashboardComponent } from './job-dashboard.component'

describe('JobDashboardComponent', () => {
  let component: JobDashboardComponent
  let fixture: ComponentFixture<JobDashboardComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [JobDashboardComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(JobDashboardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
