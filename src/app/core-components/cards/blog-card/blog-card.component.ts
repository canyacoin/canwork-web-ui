import { Component, Input } from '@angular/core'

@Component({
  selector: 'blog-card',
  templateUrl: './blog-card.component.html',
})
export class BlogCardComponent {
  @Input() thumbnail: string
  @Input() link: string
  @Input() title: string
  @Input() subTitle: string
  @Input() tags: string[]
  @Input() author: string
  @Input() datePosted: string
}
