import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InviteJobDialogComponent } from './invite-job-dialog.component';

describe('InviteJobDialogComponent', () => {
  let component: InviteJobDialogComponent;
  let fixture: ComponentFixture<InviteJobDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InviteJobDialogComponent]
    });
    fixture = TestBed.createComponent(InviteJobDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
