import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionHistoryComponent } from './action-history.component';

describe('ActionHistoryComponent', () => {
  let component: ActionHistoryComponent;
  let fixture: ComponentFixture<ActionHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActionHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
