import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { HeroService } from 'app/shared/constants/home-page'

@Component({
  selector: 'home-hero',
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
    if (value)
      this.router.navigate(['search'], {
        queryParams: { query: value },
      })
  }
}
