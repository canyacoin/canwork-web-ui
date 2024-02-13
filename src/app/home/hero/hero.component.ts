import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { HeroService } from 'app/shared/constants/home-page'
import { providerTypeArray } from 'app/const/providerTypes'

@Component({
  selector: 'home-hero',
  templateUrl: './hero.component.html',
})
export class HeroComponent {
  heroSection = HeroService
  searchInput: string = ''
  providerTypes = providerTypeArray

  constructor(private router: Router) {}

  submitSearchQuery() {
    if (this.searchInput)
      this.router.navigate(['search'], {
        // normalize with providers to keep benefits of state querystring caching
        queryParams: { query: this.searchInput, providers: JSON.stringify([]) },
      })
  }

  clickProviderTypeTag(value: string) {
    if (value)
      this.router.navigate(['search'], {
        // normalize with free text query to keep benefits of state querystring caching
        queryParams: { query: '', providers: JSON.stringify([value]) },
      })
  }
}
