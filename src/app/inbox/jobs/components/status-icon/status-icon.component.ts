import { Component, Input } from '@angular/core';
import { Job, JobState } from '@class/job';
import { UserType } from '@class/user';

@Component({
  selector: 'app-status-icon',
  templateUrl: './status-icon.component.html',
  styleUrls: ['./status-icon.component.css']
})
export class StatusIconComponent {

  @Input() job: Job;
  @Input() currentUserType: UserType;

  constructor() { }

  get stateColour() {
    switch (this.job.state) {
      case JobState.offer:
      case JobState.workPendingCompletion:
      case JobState.authorisedEscrow:
        return 'info';
      case JobState.cancelled:
      case JobState.declined:
      case JobState.inDispute:
        return 'danger';
      case JobState.providerCounterOffer:
      case JobState.clientCounterOffer:
      case JobState.termsAcceptedAwaitingEscrow:
        return 'warning';
      case JobState.complete:
      case JobState.inEscrow:
      case JobState.reviewed:
        return 'success';
      default:
        return 'primary';
    }
  }

  get stateStatus() {
    switch (this.job.state) {
      case JobState.offer:
        return 'Job offered';
      case JobState.workPendingCompletion:
        return 'Pending completion';
      case JobState.cancelled:
        return 'Cancelled by client';
      case JobState.declined:
        return 'Declined by provider';
      case JobState.inDispute:
        return 'Dispute raised';
      case JobState.providerCounterOffer:
        return 'Offer countered by provider';
      case JobState.clientCounterOffer:
        return 'Offer countered by client';
      case JobState.termsAcceptedAwaitingEscrow:
      case JobState.authorisedEscrow:
        return 'Awaiting payment to escrow';
      case JobState.inEscrow:
        return 'Funds in escrow';
      case JobState.complete:
        return 'Completed';
      case JobState.reviewed:
        return 'Reviewed';
      default:
        return '';
    }
  }
}
