import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobTransactionHistoryComponent } from './job-transaction-history.component';

describe('JobTransactionHistoryComponent', () => {
  let component: JobTransactionHistoryComponent;
  let fixture: ComponentFixture<JobTransactionHistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JobTransactionHistoryComponent]
    });
    fixture = TestBed.createComponent(JobTransactionHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
