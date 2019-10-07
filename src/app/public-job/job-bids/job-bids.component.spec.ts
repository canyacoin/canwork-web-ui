import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { JobBidsComponent } from './job-bids.component'

describe('JobBidsComponent', () => {
  let component: JobBidsComponent
  let fixture: ComponentFixture<JobBidsComponent>

  beforeEach(async(() => {
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
