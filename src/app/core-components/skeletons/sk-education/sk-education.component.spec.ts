import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkEducationComponent } from './sk-education.component';

describe('SkEducationComponent', () => {
  let component: SkEducationComponent;
  let fixture: ComponentFixture<SkEducationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SkEducationComponent]
    });
    fixture = TestBed.createComponent(SkEducationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
