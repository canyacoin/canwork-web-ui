import { Component, Input } from '@angular/core'
import { Job, JobState } from '@class/job'
import { UserType } from '@class/user'

@Component({
  selector: 'app-status-icon',
  templateUrl: './status-icon.component.html',
  styleUrls: ['./status-icon.component.css'],
})
export class StatusIconComponent {
  @Input() job: Job
  @Input() currentUserType: UserType

  constructor() {}
  get stateColour(): string {
    switch (this.job.state) {
      case JobState.offer:
      case JobState.workPendingCompletion:
        return 'info'
      case JobState.cancelled:
      case JobState.declined:
      case JobState.inDispute:
      case JobState.draft:
      case JobState.closed:
        return 'danger'
      case JobState.providerCounterOffer:
      case JobState.clientCounterOffer:
      case JobState.termsAcceptedAwaitingEscrow:
      case JobState.finishingJob:
      case JobState.processingEscrow:
        return 'warning'
      case JobState.complete:
      case JobState.inEscrow:
      case JobState.reviewed:
      case JobState.acceptingOffers:
        return 'success'
      default:
        return 'primary'
    }
  }
  /* Customizeable messages for each job status. */
  get stateStatus(): string {
    switch (this.job.state) {
      case JobState.offer:
        return 'Job offered'
      case JobState.workPendingCompletion:
        return 'Pending completion'
      case JobState.cancelled:
        return 'Cancelled by client'
      case JobState.declined:
        return 'Declined by provider'
      case JobState.inDispute:
        return 'Dispute raised'
      case JobState.providerCounterOffer:
        return 'Offer countered by provider'
      case JobState.clientCounterOffer:
        return 'Offer countered by client'
      case JobState.termsAcceptedAwaitingEscrow:
        return 'Awaiting payment to escrow'
      case JobState.inEscrow:
        return 'Funds in escrow'
      case JobState.complete:
        return 'Completed'
      case JobState.reviewed:
        return 'Reviewed'
      case JobState.acceptingOffers:
        return 'Accepting Offers'
      case JobState.closed:
        return 'Closed from public'
      case JobState.draft:
        return 'Draft'
      case JobState.processingEscrow:
        return 'Processing Escrow'
      case JobState.finishingJob:
        return 'Finishing Job'
      default:
        return ''
    }
  }
}
