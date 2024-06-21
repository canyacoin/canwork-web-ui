import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttachmentButtonComponent } from './attachment-button.component';

describe('AttachmentButtonComponent', () => {
  let component: AttachmentButtonComponent;
  let fixture: ComponentFixture<AttachmentButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AttachmentButtonComponent]
    });
    fixture = TestBed.createComponent(AttachmentButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
