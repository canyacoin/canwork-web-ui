import { Component } from '@angular/core'

@Component({
  selector: 'app-blog-page',
  templateUrl: './blog.component.html',
})
export class BlogComponent {
  queryBlog: string = ''

  handleSearchQuery(query: string) {
    this.queryBlog = query
  }
}
