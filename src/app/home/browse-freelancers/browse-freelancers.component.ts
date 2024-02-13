import { Component } from '@angular/core'
import { BrowseFreelancersService } from 'app/shared/constants/home-page'

@Component({
  selector: 'home-browse-freelancers',
  templateUrl: './browse-freelancers.component.html',
})
export class BrowseFreelancersComponent {
  browseFreelancersSection = BrowseFreelancersService
}
