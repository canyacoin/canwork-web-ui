import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { JobProposalsComponent } from './job-proposals.component'

describe('JobProposalsComponent', () => {
  let component: JobProposalsComponent
  let fixture: ComponentFixture<JobProposalsComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [JobProposalsComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(JobProposalsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
