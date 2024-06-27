import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobActionLogPanelComponent } from './job-action-log-panel.component';

describe('JobActionLogPanelComponent', () => {
  let component: JobActionLogPanelComponent;
  let fixture: ComponentFixture<JobActionLogPanelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JobActionLogPanelComponent]
    });
    fixture = TestBed.createComponent(JobActionLogPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
