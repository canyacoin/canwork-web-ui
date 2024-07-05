import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobSwitchActionTransactionPanelComponent } from './job-switch-action-transaction-panel.component';

describe('JobSwitchActionTransactionPanelComponent', () => {
  let component: JobSwitchActionTransactionPanelComponent;
  let fixture: ComponentFixture<JobSwitchActionTransactionPanelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JobSwitchActionTransactionPanelComponent]
    });
    fixture = TestBed.createComponent(JobSwitchActionTransactionPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
