import { Component, EventEmitter, Output } from '@angular/core'
import { HeroService } from 'app/shared/constants/blog'

@Component({
  selector: 'blog-hero',
  templateUrl: './hero.component.html',
})
export class HeroComponent {
  heroSection = HeroService
  searchInput: string = ''
  @Output() searchQuerySubmitted: EventEmitter<string> = new EventEmitter()

  submitSearchQuery() {
    this.searchQuerySubmitted.emit(this.searchInput)
  }

  submitSearchTag(value: string) {
    if (value) {
      this.searchInput = value
      this.searchQuerySubmitted.emit(value)
    }
  }

  constructor() {}
}
