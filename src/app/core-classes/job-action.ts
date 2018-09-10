import { Job, PaymentType, TimeRange, WorkType } from '@class/job';
import { User, UserType } from '@class/user';

import * as moment from 'moment';

export class IJobAction {
  type: ActionType;
  executedBy: UserType;
  userId: string;
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

  constructor() {
    this.timestamp = moment().format('x')
    switch (this.type) {
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
    return `Job action: ${this.type}, by '${executor}'`
  }

  getPaymentTypeString(): string {
    return this.paymentType && this.paymentType === PaymentType.hourly ? '/hr' : '/total'
  }
}

export class CreateJobAction extends IJobAction {
  type = ActionType.createJob

  getMessage(executor?: string): string {
    return `Job created by '${executor}'.<br>
      Proposed budget at $${this.USD}${this.getPaymentTypeString()} (${this.CAN} CAN)
      for ${this.weeklyCommitment} hours a week
      for ${this.timelineExpectation}`
  }
}

export class CounterOfferAction extends IJobAction {
  type = ActionType.counterOffer

  getMessage(executor?: string): string {
    return `'${executor}' proposed a counter offer.<br>
      Proposed budget at $${this.USD}${this.getPaymentTypeString()} (${this.CAN} CAN)`
  }
}
export class AcceptTermsAction extends IJobAction {
  type = ActionType.acceptTerms

  getMessage(executor?: string): string {
    return `'${executor}' accepted the terms of this job.`
  }
}

export class DeclineTermsAction extends IJobAction {
  type = ActionType.declineTerms

  getMessage(executor?: string): string {
    return `'${executor}' declined the terms of this job.`
  }
}

export class CancelJobAction extends IJobAction {
  type = ActionType.cancelJob

  getMessage(executor?: string): string {
    return `'${executor}' cancelled this job.`
  }
}

export class AddMessageAction extends IJobAction {
  type = ActionType.addMessage

  getMessage(executor?: string): string {
    return `'${executor}' left a message:<br>
      <em>${this.message}</em>`
  }
}

export class RaiseDisputeAction extends IJobAction {
  type = ActionType.dispute
}

export class AuthoriseEscrowAction extends IJobAction {
  type = ActionType.authoriseEscrow
  getMessage(executor?: string): string {
    return `'${executor}' authorised the Escrow contract to transfer $${this.USD} (${this.CAN} CAN)<br>
      Balance will be transferred to the provider when the job is finished.`
  }
}

export class EnterEscrowAction extends IJobAction {
  type = ActionType.enterEscrow
  getMessage(executor?: string): string {
    return `'${executor}' registered this job in the Escrow contract.<br>
      When the job is succesfully delivered, '${executor}' will release the funds stored in the contract.`
  }
}

export enum ActionType {
  createJob = 'Create job',
  cancelJob = 'Cancel job',
  declineTerms = 'Decline terms',
  counterOffer = 'Counter offer',
  acceptTerms = 'Accept terms',
  authoriseEscrow = 'Authorise escrow',
  enterEscrow = 'Send CAN to escrow',
  addMessage = 'Add message',
  finishedJob = 'Mark as complete',
  acceptFinish = 'Complete job',
  dispute = 'Raise dispute'
}
