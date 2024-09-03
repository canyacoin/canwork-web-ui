import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostJobCardComponent } from './post-job-card.component';

describe('PostJobCardComponent', () => {
  let component: PostJobCardComponent;
  let fixture: ComponentFixture<PostJobCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PostJobCardComponent]
    });
    fixture = TestBed.createComponent(PostJobCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
