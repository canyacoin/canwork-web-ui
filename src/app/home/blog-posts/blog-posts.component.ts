import { Component } from '@angular/core';
import { BlogPostsService } from 'app/shared/constants/home';

@Component({
  selector: 'home-blog-posts',
  templateUrl: './blog-posts.component.html'
})
export class BlogPostsComponent {
  BlogPostsSection = BlogPostsService;
}