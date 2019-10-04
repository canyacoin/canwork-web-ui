import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletBnbComponent } from './wallet-bnb.component';

describe('WalletBnbComponent', () => {
  let component: WalletBnbComponent;
  let fixture: ComponentFixture<WalletBnbComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WalletBnbComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletBnbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
