import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { BrowseFreelancersService } from 'app/shared/constants/home-page'
import { providerTypeArray } from 'app/shared/constants/providerTypes'

@Component({
  selector: 'home-browse-freelancers',
  templateUrl: './browse-freelancers.component.html',
})
export class BrowseFreelancersComponent {
  browseFreelancersSection = BrowseFreelancersService
  providerTypeArray = providerTypeArray

  constructor(private router: Router) {}

  clickProviderTypeTag(value: string) {
    if (value)
      this.router.navigate(['search'], {
        // normalize with free text query to keep benefits of state querystring caching
        queryParams: { query: '', providers: JSON.stringify([value]) },
      })
  }
}
