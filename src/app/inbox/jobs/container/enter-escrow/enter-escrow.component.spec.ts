import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnterEscrowComponent } from './enter-escrow.component';

describe('EnterEscrowComponent', () => {
  let component: EnterEscrowComponent;
  let fixture: ComponentFixture<EnterEscrowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnterEscrowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnterEscrowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
