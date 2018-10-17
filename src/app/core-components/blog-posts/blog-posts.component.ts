import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-blog-posts',
  templateUrl: './blog-posts.component.html',
  styleUrls: ['./blog-posts.component.css']
})
export class BlogPostsComponent implements OnInit {

  mediumLink = 'https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@canyacoin';
  placeholder = 'assets/img/outandabout.png';
  mediumFeed = [];
  canLook = false;
  constructor() { }

  async ngOnInit() {
    await this.fetchMedium()
  }

  async fetchMedium() {
    fetch(this.mediumLink).then((res) => res.json()).then((data) => {
      for (let i = 0 ; i < 3; i++) {
          this.mediumFeed.push(data.items[i]);
      }
    })
  }
}
