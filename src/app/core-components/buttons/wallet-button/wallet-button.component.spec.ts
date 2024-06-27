import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletButtonComponent } from './wallet-button.component';

describe('WalletButtonComponent', () => {
  let component: WalletButtonComponent;
  let fixture: ComponentFixture<WalletButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WalletButtonComponent]
    });
    fixture = TestBed.createComponent(WalletButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
