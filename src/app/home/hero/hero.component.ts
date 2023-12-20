import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { HeroService } from 'app/shared/constants/home'

@Component({
  selector: 'hero',
  templateUrl: './hero.component.html',
})
export class HeroComponent {
  heroSection = HeroService

  constructor(private router: Router) {}

  submitSearchQuery(value: string) {
    if (value)
      this.router.navigate(['search'], {
        queryParams: { query: value },
      })
  }
}
