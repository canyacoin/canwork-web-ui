import { Component, OnInit } from '@angular/core';

import { FeedService } from '../../core-services/feed.service';

@Component({
  selector: 'app-blog-posts',
  templateUrl: './blog-posts.component.html',
  styleUrls: ['./blog-posts.component.css']
})
export class BlogPostsComponent implements OnInit {

  feed: any = [];

  placeholder = 'assets/img/outandabout.png';

  constructor(private feedService: FeedService) { }

  ngOnInit() {
    this.feedService.getItems().subscribe((result: any) => {
      result.subscribe((data) => {
        data.slice(0, 3).map((item) => {
          this.feed.push(item);
        });
      });
    });
  }

}
