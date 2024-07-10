import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackToEditButtonComponent } from './back-to-edit-button.component';

describe('BackToEditButtonComponent', () => {
  let component: BackToEditButtonComponent;
  let fixture: ComponentFixture<BackToEditButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BackToEditButtonComponent]
    });
    fixture = TestBed.createComponent(BackToEditButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
