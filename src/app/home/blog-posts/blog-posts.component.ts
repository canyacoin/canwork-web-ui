import { Component, OnInit } from '@angular/core';

import { FeedService } from '../../core-services/feed.service';
import { FeedItem } from '../../core-classes/feed-item';

@Component({
  selector: 'app-blog-posts',
  templateUrl: './blog-posts.component.html',
  styleUrls: ['./blog-posts.component.css']
})
export class BlogPostsComponent implements OnInit {

  feed: any = [];

  placeholder = 'assets/img/outandabout.png';

  constructor(private feedService: FeedService) { }

  async ngOnInit() {
    this.feed = await this.feedService.getItemsAsync(3);
  }
}
