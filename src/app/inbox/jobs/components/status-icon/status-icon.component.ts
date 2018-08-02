import { Component, Input } from '@angular/core';

import { Job, JobState, PaymentType } from '../../../../core-classes/job';
import { User, UserType } from '../../../../core-classes/user';

@Component({
  selector: 'app-status-icon',
  templateUrl: './status-icon.component.html',
  styleUrls: ['./status-icon.component.css']
})
export class StatusIconComponent {

  @Input() job: Job;
  @Input() currentUserType: UserType;

  constructor() { }

  get stateColour(): string {
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
        return 'success';
      default:
        return 'primary';
    }
  }

  /* Customizeable messages for each job status. */
  get stateStatus(): string {
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
        return this.currentUserType === UserType.client ? 'Awaiting escrow authorisation' : 'Awaiting payment to escrow';
      case JobState.authorisedEscrow:
        return this.currentUserType === UserType.client ? 'Awaiting escrow deposit' : 'Awaiting payment to escrow';
      case JobState.inEscrow:
        return 'Funds in escrow';
      case JobState.complete:
        return 'Completed';
      default:
        return '';
    }
  }
}
