import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CanAppComponent } from './can-app.component';

describe('CanAppComponent', () => {
  let component: CanAppComponent;
  let fixture: ComponentFixture<CanAppComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CanAppComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CanAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
