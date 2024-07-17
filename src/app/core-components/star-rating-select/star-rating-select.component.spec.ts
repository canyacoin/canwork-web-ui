import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StarRatingSelectComponent } from './star-rating-select.component';

describe('StarRatingSelectComponent', () => {
  let component: StarRatingSelectComponent;
  let fixture: ComponentFixture<StarRatingSelectComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StarRatingSelectComponent]
    });
    fixture = TestBed.createComponent(StarRatingSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
