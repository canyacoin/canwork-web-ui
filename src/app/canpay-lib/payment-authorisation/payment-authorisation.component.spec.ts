import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentAuthorisationComponent } from './payment-authorisation.component';

describe('PaymentAuthorisationComponent', () => {
  let component: PaymentAuthorisationComponent;
  let fixture: ComponentFixture<PaymentAuthorisationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentAuthorisationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentAuthorisationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
