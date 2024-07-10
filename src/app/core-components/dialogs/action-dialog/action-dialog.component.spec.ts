import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionDialogComponent } from './action-dialog.component';

describe('ActionDialogComponent', () => {
  let component: ActionDialogComponent;
  let fixture: ComponentFixture<ActionDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ActionDialogComponent]
    });
    fixture = TestBed.createComponent(ActionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
