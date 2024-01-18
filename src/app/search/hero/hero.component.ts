import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { HeroService } from 'app/shared/constants/search-page'

@Component({
  selector: 'search-hero',
  templateUrl: './hero.component.html',
})
export class HeroComponent {
  heroSection = HeroService
  searchInput: string = ''

  constructor(private router: Router) {}

  submitSearchQuery() {
    if (this.searchInput)
      this.router.navigate(['search'], {
        queryParams: { query: this.searchInput },
      })
  }

  submitSearchTag(value: string) {
    if (value) {
      this.searchInput = value
      this.router.navigate(['search'], {
        queryParams: { query: value },
      })
    }
  }
}
