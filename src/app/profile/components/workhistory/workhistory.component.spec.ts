import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkhistoryComponent } from './workhistory.component';

describe('WorkhistoryComponent', () => {
  let component: WorkhistoryComponent;
  let fixture: ComponentFixture<WorkhistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WorkhistoryComponent]
    });
    fixture = TestBed.createComponent(WorkhistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
