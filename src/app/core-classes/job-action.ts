import { PaymentType, TimeRange, WorkType } from '@class/job';
import { UserType } from '@class/user';
import { Action } from 'rxjs/scheduler/Action';

import * as moment from 'moment';

export class IJobAction {
  type: ActionType;
  executedBy: UserType;
  timestamp: string;
  private: boolean;
  emailSent: boolean;

  USD: number;
  CAN: number;
  workType: WorkType;
  timelineExpectation: TimeRange;
  weeklyCommitment: number;
  paymentType: PaymentType;
  txId: string;
  amountCan: number;
  amount: number

  message: string;

  constructor(type: ActionType, executedBy: UserType) {
    this.type = type;
    this.executedBy = executedBy;
    this.timestamp = moment().format('x')
    switch (this.type) {
      case ActionType.review:
      case ActionType.authoriseEscrow:
        this.private = true;
        break;
      default:
        this.private = false;
        break;
    }
  }

  init(init: Partial<IJobAction>) {
    Object.assign(this, init)
    return this
  }

  getMessage?(executor?: string): string {
    switch (this.type) {
      case ActionType.createJob:
        return `Job created by ${executor}.<br>
        Proposed budget at $${this.USD}${this.paymentTypeString} (${this.CAN} CAN)
        for ${this.weeklyCommitment} hours a week
        for ${this.timelineExpectation}`;
      case ActionType.counterOffer:
        return `${executor} proposed a counter offer.<br>
        Proposed budget at $${this.USD}${this.paymentTypeString} (${this.CAN} CAN)`;
      case ActionType.acceptTerms:
        return `${executor} accepted the terms of this job.`
      case ActionType.declineTerms:
        return `${executor} declined the terms of this job.`
      case ActionType.addMessage:
        return `${executor} left a message:<br>
            <em>${this.message}</em>`
      case ActionType.declineTerms:
        return `${executor} cancelled this job.`
      case ActionType.authoriseEscrow:
        return `${executor} authorised the Escrow contract to transfer ${this.amountCan} CAN`
      case ActionType.enterEscrow:
        return `${executor} registered this job in the Escrow contract.<br>
            When the job is succesfully delivered, ${executor} will release the funds stored in the contract.`
      default:
        return `Job action: ${this.type}, by ${executor}`
    }
  }

  get paymentTypeString(): string {
    return this.paymentType && this.paymentType === PaymentType.hourly ? '/hr' : '/total'
  }
}

export class CreateJobAction extends IJobAction {
  type = ActionType.createJob
}
export class CounterOfferAction extends IJobAction {
  type = ActionType.counterOffer
}
export class AcceptTermsAction extends IJobAction {
  type = ActionType.acceptTerms
}

export class DeclineTermsAction extends IJobAction {
  type = ActionType.declineTerms

}

export class CancelJobAction extends IJobAction {
  type = ActionType.cancelJob

}

export class AddMessageAction extends IJobAction {
  type = ActionType.addMessage

  getMessage(executor?: string): string {
  }
}

export class ReviewAction extends IJobAction {
  type = ActionType.review
  isClientSatisfied: boolean
  private = true
}

export class RaiseDisputeAction extends IJobAction {
  type = ActionType.dispute
}

export class AuthoriseEscrowAction extends IJobAction {
  type = ActionType.authoriseEscrow
  private = true;
}

export class EnterEscrowAction extends IJobAction {
  type = ActionType.enterEscrow
}

export enum ActionType {
  createJob = 'Create job',
  cancelJob = 'Cancel job',
  declineTerms = 'Decline terms',
  counterOffer = 'Counter offer',
  acceptTerms = 'Accept terms',
  authoriseEscrow = 'Authorise escrow',
  enterEscrow = 'Send CAN to escrow',
  addMessage = 'Add Note',
  finishedJob = 'Mark as complete',
  acceptFinish = 'Complete job',
  dispute = 'Raise dispute',
  review = 'Leave a review',
}
