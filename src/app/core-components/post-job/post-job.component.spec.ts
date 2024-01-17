import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostJobComponent } from './post-job.component';

describe('PostJobComponent', () => {
  let component: PostJobComponent;
  let fixture: ComponentFixture<PostJobComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostJobComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostJobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
