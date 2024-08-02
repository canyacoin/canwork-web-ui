import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostJobMoreButtonComponent } from './post-job-more-button.component';

describe('PostJobMoreButtonComponent', () => {
  let component: PostJobMoreButtonComponent;
  let fixture: ComponentFixture<PostJobMoreButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PostJobMoreButtonComponent]
    });
    fixture = TestBed.createComponent(PostJobMoreButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
