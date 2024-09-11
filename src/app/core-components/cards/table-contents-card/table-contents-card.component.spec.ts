import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableContentsCardComponent } from './table-contents-card.component';

describe('TableContentsCardComponent', () => {
  let component: TableContentsCardComponent;
  let fixture: ComponentFixture<TableContentsCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TableContentsCardComponent]
    });
    fixture = TestBed.createComponent(TableContentsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
