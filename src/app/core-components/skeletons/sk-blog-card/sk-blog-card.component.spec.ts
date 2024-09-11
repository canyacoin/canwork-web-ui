import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkBlogCardComponent } from './sk-blog-card.component';

describe('SkBlogCardComponent', () => {
  let component: SkBlogCardComponent;
  let fixture: ComponentFixture<SkBlogCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SkBlogCardComponent]
    });
    fixture = TestBed.createComponent(SkBlogCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
