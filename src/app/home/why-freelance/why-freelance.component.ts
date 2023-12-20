import { Component } from '@angular/core'
import { WhyFreelanceService } from 'app/shared/constants/home'

@Component({
  selector: 'why-freelance',
  templateUrl: './why-freelance.component.html',
})
export class WhyFreelanceComponent {
  whyFreelanceSection = WhyFreelanceService
}
