import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobReviewPanelComponent } from './job-review-panel.component';

describe('JobReviewPanelComponent', () => {
  let component: JobReviewPanelComponent;
  let fixture: ComponentFixture<JobReviewPanelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JobReviewPanelComponent]
    });
    fixture = TestBed.createComponent(JobReviewPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
