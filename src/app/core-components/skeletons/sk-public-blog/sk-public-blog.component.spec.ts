import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkPublicBlogComponent } from './sk-public-blog.component';

describe('SkPublicBlogComponent', () => {
  let component: SkPublicBlogComponent;
  let fixture: ComponentFixture<SkPublicBlogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SkPublicBlogComponent]
    });
    fixture = TestBed.createComponent(SkPublicBlogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
