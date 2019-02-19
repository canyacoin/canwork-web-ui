import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EtherscanLinkComponent } from './etherscan-link.component';

describe('EtherscanLinkComponent', () => {
  let component: EtherscanLinkComponent;
  let fixture: ComponentFixture<EtherscanLinkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EtherscanLinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EtherscanLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
