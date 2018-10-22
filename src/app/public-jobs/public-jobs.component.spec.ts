import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicJobsComponent } from './public-jobs.component';

describe('PublicJobsComponent', () => {
  let component: PublicJobsComponent;
  let fixture: ComponentFixture<PublicJobsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PublicJobsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
