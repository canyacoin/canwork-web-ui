import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkWorkhistoryComponent } from './sk-workhistory.component';

describe('SkWorkhistoryComponent', () => {
  let component: SkWorkhistoryComponent;
  let fixture: ComponentFixture<SkWorkhistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SkWorkhistoryComponent]
    });
    fixture = TestBed.createComponent(SkWorkhistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
