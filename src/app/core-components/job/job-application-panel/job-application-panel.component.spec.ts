import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobApplicationPanelComponent } from './job-application-panel.component';

describe('JobApplicationPanelComponent', () => {
  let component: JobApplicationPanelComponent;
  let fixture: ComponentFixture<JobApplicationPanelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JobApplicationPanelComponent]
    });
    fixture = TestBed.createComponent(JobApplicationPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
