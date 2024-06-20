import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobStatusPanelComponent } from './job-status-panel.component';

describe('JobStatusPanelComponent', () => {
  let component: JobStatusPanelComponent;
  let fixture: ComponentFixture<JobStatusPanelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JobStatusPanelComponent]
    });
    fixture = TestBed.createComponent(JobStatusPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
