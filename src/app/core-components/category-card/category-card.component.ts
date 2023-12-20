import { Component, Input } from '@angular/core'
@Component({
  selector: 'category-card',
  templateUrl: './category-card.component.html',
})
export class CategoryCardComponent {
  @Input() iconSrc!: string
  @Input() title!: string
  @Input() description!: string
}
