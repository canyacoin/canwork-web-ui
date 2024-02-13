import { Component, Input } from '@angular/core'

@Component({
  selector: 'app-star-rating',
  templateUrl: './star-rating.component.html',
})
export class StarRatingComponent {
  @Input() stars!: number

  get starFullCSS() {
    return 'w-[20px]'
  }
}
