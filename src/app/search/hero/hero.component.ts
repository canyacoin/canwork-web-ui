import { Component, Input, Output, EventEmitter } from '@angular/core'
import { Router } from '@angular/router'
import { HeroService } from 'app/shared/constants/search-page'

@Component({
  selector: 'search-hero',
  templateUrl: './hero.component.html',
})
export class HeroComponent {
  heroSection = HeroService
  //searchInput: string = ''
  @Input() searchInput: string = ''
  @Output() searchInputChange = new EventEmitter<string>() // two way binding to parent

  constructor(private router: Router) {}

  onSearchInputChange(searchValue: string): void {
    this.searchInputChange.emit(searchValue) // notify parent and algolia handler
  }

  submitSearchQuery() {
    // explicit click the search button by user

    // same behaviour of on change
    this.searchInputChange.emit(this.searchInput) // notify parent and algolia handler
  }

  submitSearchTag(value: string) {
    /*
    // todo
    if (value) {
      this.searchInput = value
      this.router.navigate(['search'], {
        queryParams: { query: value },
      })
    }
    */
  }
}
