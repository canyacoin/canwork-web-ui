import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobFreelancerInformationPanelComponent } from './job-freelancer-information-panel.component';

describe('JobFreelancerInformationPanelComponent', () => {
  let component: JobFreelancerInformationPanelComponent;
  let fixture: ComponentFixture<JobFreelancerInformationPanelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JobFreelancerInformationPanelComponent]
    });
    fixture = TestBed.createComponent(JobFreelancerInformationPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
