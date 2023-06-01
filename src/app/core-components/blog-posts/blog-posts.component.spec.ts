import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { BlogPostsComponent } from './blog-posts.component'

describe('BlogPostsComponent', () => {
  let component: BlogPostsComponent
  let fixture: ComponentFixture<BlogPostsComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [BlogPostsComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BlogPostsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
