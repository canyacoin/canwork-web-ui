import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CanpayWizardComponent } from './canpay-wizard.component';

describe('CanpayWizardComponent', () => {
  let component: CanpayWizardComponent;
  let fixture: ComponentFixture<CanpayWizardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CanpayWizardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CanpayWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
