import { Component, Input } from '@angular/core'
import { Bid } from '@class/job'

@Component({
  selector: 'job-freelancer-information-panel',
  templateUrl: './job-freelancer-information-panel.component.html',
})
export class JobFreelancerInformationPanelComponent {
  @Input() selectedBid!: Bid

  ngOnInit() {
    console.log('=======================================')
    console.log('this.selectedBid = ' + this.selectedBid)
  }
}
