import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SwiperCardsComponent } from './swiper-cards.component';

describe('SwiperCardsComponent', () => {
  let component: SwiperCardsComponent;
  let fixture: ComponentFixture<SwiperCardsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SwiperCardsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SwiperCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
