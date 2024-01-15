import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicTagComponent } from './basic-tag.component';

describe('BasicTagComponent', () => {
  let component: BasicTagComponent;
  let fixture: ComponentFixture<BasicTagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BasicTagComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BasicTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
