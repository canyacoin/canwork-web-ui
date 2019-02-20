import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BancorWcComponent } from './balance-check.component';

describe('BancorWcComponent', () => {
  let component: BancorWcComponent;
  let fixture: ComponentFixture<BancorWcComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BancorWcComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BancorWcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
