import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { JobProposalsPanelComponent } from './job-proposals.component'

describe('JobProposalsPanelComponent', () => {
  let component: JobProposalsPanelComponent
  let fixture: ComponentFixture<JobProposalsPanelComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [JobProposalsPanelComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(JobProposalsPanelComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
