import { Component, EventEmitter, Output } from '@angular/core'
import { HeroService } from 'app/shared/constants/faqs-page'

@Component({
  selector: 'faqs-hero',
  templateUrl: './hero.component.html',
})
export class HeroComponent {
  @Output() searchQuerySubmitted: EventEmitter<string> = new EventEmitter()
  heroSection = HeroService

  submitSearchQuery(value: string) {
    this.searchQuerySubmitted.emit(value)
  }
}
