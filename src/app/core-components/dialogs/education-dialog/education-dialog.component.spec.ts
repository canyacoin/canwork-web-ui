import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EducationDialogComponent } from './education-dialog.component';

describe('EducationDialogComponent', () => {
  let component: EducationDialogComponent;
  let fixture: ComponentFixture<EducationDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EducationDialogComponent]
    });
    fixture = TestBed.createComponent(EducationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
