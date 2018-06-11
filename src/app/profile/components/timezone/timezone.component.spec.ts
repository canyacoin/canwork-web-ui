import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimezoneComponent } from './timezone.component';

describe('TimezoneComponent', () => {
  let component: TimezoneComponent;
  let fixture: ComponentFixture<TimezoneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimezoneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimezoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
