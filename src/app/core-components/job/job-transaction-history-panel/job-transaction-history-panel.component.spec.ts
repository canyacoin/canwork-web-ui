import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobTransactionHistoryPanelComponent } from './job-transaction-history-panel.component';

describe('JobTransactionHistoryPanelComponent', () => {
  let component: JobTransactionHistoryPanelComponent;
  let fixture: ComponentFixture<JobTransactionHistoryPanelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JobTransactionHistoryPanelComponent]
    });
    fixture = TestBed.createComponent(JobTransactionHistoryPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
