import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkhistoryDialogComponent } from './workhistory-dialog.component';

describe('WorkhistoryDialogComponent', () => {
  let component: WorkhistoryDialogComponent;
  let fixture: ComponentFixture<WorkhistoryDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WorkhistoryDialogComponent]
    });
    fixture = TestBed.createComponent(WorkhistoryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
