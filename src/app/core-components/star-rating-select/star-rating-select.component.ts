import { Component, Input, Output, EventEmitter } from '@angular/core'

@Component({
  selector: 'star-rating-select',
  templateUrl: './star-rating-select.component.html',
})
export class StarRatingSelectComponent {
  private _stars: number
  @Input()
  get stars(): number {
    return this._stars
  }
  set stars(value: number) {
    this._stars = value
    this.starChange.emit(this._stars)
  }
  @Output() starChange = new EventEmitter<number>()

  setStar(value: number) {
    this.stars = value
  }
}
