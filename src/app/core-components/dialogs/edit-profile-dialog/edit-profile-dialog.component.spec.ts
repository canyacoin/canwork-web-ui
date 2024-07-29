import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditProfileDialogComponent } from './edit-profile-dialog.component';

describe('EditProfileDialogComponent', () => {
  let component: EditProfileDialogComponent;
  let fixture: ComponentFixture<EditProfileDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditProfileDialogComponent]
    });
    fixture = TestBed.createComponent(EditProfileDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
