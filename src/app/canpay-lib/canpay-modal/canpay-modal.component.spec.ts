import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CanpayModalComponent } from './canpay-modal.component';

describe('CanpayModalComponent', () => {
  let component: CanpayModalComponent;
  let fixture: ComponentFixture<CanpayModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CanpayModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CanpayModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
