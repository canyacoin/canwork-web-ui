import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MetamaskComponent } from './metamask.component';

describe('MetamaskComponent', () => {
  let component: MetamaskComponent;
  let fixture: ComponentFixture<MetamaskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MetamaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MetamaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
