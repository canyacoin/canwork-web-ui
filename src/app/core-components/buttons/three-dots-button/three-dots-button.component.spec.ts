import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreeDotsButtonComponent } from './three-dots-button.component';

describe('ThreeDotsButtonComponent', () => {
  let component: ThreeDotsButtonComponent;
  let fixture: ComponentFixture<ThreeDotsButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ThreeDotsButtonComponent]
    });
    fixture = TestBed.createComponent(ThreeDotsButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
