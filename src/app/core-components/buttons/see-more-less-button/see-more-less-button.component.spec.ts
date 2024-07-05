import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeeMoreLessButtonComponent } from './see-more-less-button.component';

describe('SeeMoreLessButtonComponent', () => {
  let component: SeeMoreLessButtonComponent;
  let fixture: ComponentFixture<SeeMoreLessButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SeeMoreLessButtonComponent]
    });
    fixture = TestBed.createComponent(SeeMoreLessButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
