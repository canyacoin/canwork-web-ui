import { Component, Input } from '@angular/core'
import { Job, JobState } from '@class/job'
// import { UserType } from '@class/user'

@Component({
  selector: 'status-icon',
  templateUrl: './status-icon.component.html',
})
export class StatusIconComponent {
  @Input() job: Job
  // @Input() currentUserType: UserType

  constructor() {}

  get stateColour(): string {
    switch (this.job.state) {
      case JobState.offer:
      case JobState.workPendingCompletion:
      case JobState.cancelled:
        return 'bg-R500'
      case JobState.cancelledByProvider:
        return 'bg-R500'
      case JobState.declined:
      case JobState.inDispute:
      case JobState.draft:
      case JobState.closed:
        return 'bg-G500'
      case JobState.providerCounterOffer:
      case JobState.clientCounterOffer:
      case JobState.termsAcceptedAwaitingEscrow:
        return 'bg-start-g1'
      case JobState.finishingJob:
      case JobState.processingEscrow:
        return 'bg-start-g1'
      case JobState.complete:
      case JobState.inEscrow:
        return 'bg-vibrantGreen'
      case JobState.reviewed:
      case JobState.acceptingOffers:
        return 'bg-vibrantGreen'
      default:
        return 'bg-G500'
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
      case JobState.cancelledByProvider:
        return 'Cancelled by provider'
      case JobState.declined:
        return 'Declined by provider'
      case JobState.inDispute:
        return 'Dispute raised'
      case JobState.providerCounterOffer:
        return 'Offer countered by provider'
      case JobState.clientCounterOffer:
        return 'Offer countered by client'
      case JobState.termsAcceptedAwaitingEscrow:
        return 'Awaiting escrow payment'
      case JobState.inEscrow:
        return 'Funds in Escrow'
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
