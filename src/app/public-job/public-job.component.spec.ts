import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicJobComponent } from './public-job.component';

describe('PublicJobComponent', () => {
  let component: PublicJobComponent;
  let fixture: ComponentFixture<PublicJobComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PublicJobComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicJobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
