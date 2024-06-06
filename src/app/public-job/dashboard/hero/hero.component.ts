import { Component, Input, Output, EventEmitter } from '@angular/core'
import { Router } from '@angular/router'
import { HeroService } from 'app/shared/constants/public-job-dashboard-page'
import { providerJobTypeArray } from 'app/shared/constants/public-job-dashboard-page'

@Component({
  selector: 'dashboard-hero',
  templateUrl: './hero.component.html',
})
export class HeroComponent {
  heroSection = HeroService
  providerTypes = providerJobTypeArray
  //searchInput: string = ''
  @Input() searchInput: string = ''
  @Output() searchInputChange = new EventEmitter<string>() // two way binding to parent
  @Input() providerFilters = []
  @Output() providerFiltersChange = new EventEmitter<any>() // two way binding to parent
  selectedFilters = {}

  constructor(private router: Router) {}

  onSearchInputChange(searchValue: string): void {
    // this.searchInputChange.emit(searchValue) // notify parent and algolia handler
  }

  submitSearchQuery() {
    // explicit click the search button by user

    // same behaviour of on change
    this.searchInputChange.emit(this.searchInput) // notify parent and algolia handler
  }

  isProviderTypeSelected(providerName: string) {
    const isInArray = this.providerFilters.find(function (element) {
      return element === providerName
    })
    if (typeof isInArray === 'undefined') return false
    else return true
  }

  clickProviderTypeTag(providerName: string) {
    // update local state and ui
    if (providerName) {
      if (!this.isProviderTypeSelected(providerName)) {
        this.providerFilters.push(providerName) // select it
      } else {
        const index = this.providerFilters.findIndex(function (element) {
          return element === providerName
        })
        this.providerFilters.splice(index, 1) // deselect id
      }
      this.providerFiltersChange.emit(this.providerFilters) // notify parent and algolia handler
    }
  }
}
