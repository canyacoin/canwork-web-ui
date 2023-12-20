import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopPortfoliosComponent } from './top-portfolios.component';

describe('TopPortfoliosComponent', () => {
  let component: TopPortfoliosComponent;
  let fixture: ComponentFixture<TopPortfoliosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TopPortfoliosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopPortfoliosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
