import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DelTagComponent } from './del-tag.component';

describe('DelTagComponent', () => {
  let component: DelTagComponent;
  let fixture: ComponentFixture<DelTagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DelTagComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DelTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
