import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompleteJobComponent } from './complete-job.component';

describe('CompleteJobComponent', () => {
  let component: CompleteJobComponent;
  let fixture: ComponentFixture<CompleteJobComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompleteJobComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompleteJobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
