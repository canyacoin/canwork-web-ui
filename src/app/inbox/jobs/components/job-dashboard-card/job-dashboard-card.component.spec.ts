import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { JobDashboardCardComponent } from './job-dashboard-card.component'

describe('JobDashboardCardComponent', () => {
  let component: JobDashboardCardComponent
  let fixture: ComponentFixture<JobDashboardCardComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [JobDashboardCardComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(JobDashboardCardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
