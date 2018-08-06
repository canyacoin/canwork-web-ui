import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusLightComponent } from './status-light.component';

describe('StatusLightComponent', () => {
  let component: StatusLightComponent;
  let fixture: ComponentFixture<StatusLightComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatusLightComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusLightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
