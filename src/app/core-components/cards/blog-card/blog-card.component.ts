import { Component, Input } from '@angular/core'

@Component({
  selector: 'blog-card',
  templateUrl: './blog-card.component.html',
})
export class BlogCardComponent {
  @Input() thumbnail: string
  @Input() slug: string = ''
  @Input() title: string
  @Input() subTitle: string
  @Input() body: string
  @Input() tags: string[]
  @Input() author: string
  @Input() datePosted: string
  @Input() isAdmin: boolean = false

  readingTime() {
    return Math.ceil(this.body.length / 1000)
  }
}
