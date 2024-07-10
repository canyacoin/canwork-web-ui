import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaiseDisputeButtonComponent } from './raise-dispute-button.component';

describe('RaiseDisputeButtonComponent', () => {
  let component: RaiseDisputeButtonComponent;
  let fixture: ComponentFixture<RaiseDisputeButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RaiseDisputeButtonComponent]
    });
    fixture = TestBed.createComponent(RaiseDisputeButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
