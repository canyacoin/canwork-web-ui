import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelJobComponent } from './cancel-job.component';

describe('CancelJobComponent', () => {
  let component: CancelJobComponent;
  let fixture: ComponentFixture<CancelJobComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CancelJobComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CancelJobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
