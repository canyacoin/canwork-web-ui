import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicCoinComponent } from './dynamic-coin.component';

describe('DynamicCoinComponent', () => {
  let component: DynamicCoinComponent;
  let fixture: ComponentFixture<DynamicCoinComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DynamicCoinComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicCoinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
