import { Component } from '@angular/core'
import { WhyFreelanceService } from 'app/shared/constants/home-page'

@Component({
  selector: 'home-why-freelance',
  templateUrl: './why-freelance.component.html',
})
export class WhyFreelanceComponent {
  whyFreelanceSection = WhyFreelanceService
}
