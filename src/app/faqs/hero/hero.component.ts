import { Component, EventEmitter, Output } from '@angular/core'
import { HeroService } from 'app/shared/constants/faqs-page'

@Component({
  selector: 'faqs-hero',
  templateUrl: './hero.component.html',
})
export class HeroComponent {
  heroSection = HeroService
  searchInput: string = ''
  @Output() searchQuerySubmitted: EventEmitter<string> = new EventEmitter()

  submitSearchQuery() {
    this.searchQuerySubmitted.emit(this.searchInput)
  }
}
