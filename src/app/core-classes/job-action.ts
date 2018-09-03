import * as moment from 'moment';
import { Job, WorkType, TimeRange, PaymentType } from '@class/job';
import { User, UserType } from '@class/user';
import { THROW_IF_NOT_FOUND } from '@angular/core/src/di/injector';

export class IJobAction {
  type: ActionType;
  executedBy: UserType;
  userId: string;
  timestamp: string;
  private: boolean;
  emailSent: boolean;
  job?: Job;
  user?: User;
  USD: number;
  CAN: number;
  workType: WorkType;
  timelineExpectation: TimeRange;
  weeklyCommitment: number;
  paymentType: PaymentType;
  txId: string;
  amountCan: number;
  message: string;

  constructor(type: ActionType, executedBy: UserType) {
    this.type = type;
    this.executedBy = executedBy;
    this.timestamp = moment().format('x');
    switch (type) {
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
  constructor(user: User, job: Job) {
    super(ActionType.createJob, user.type)
    this.job = job
  }

  getMessage(executor?: string): string {
    return `Job created by '${executor}'.<br>
      Proposed budget at $${this.USD}${this.getPaymentTypeString()} (${this.CAN} CAN)
      for ${this.weeklyCommitment} hours a week
      for ${this.timelineExpectation}`
  }
}

export class CounterOfferAction extends IJobAction {
  amount: number;

  constructor(user: User, job: Job) {
    super(ActionType.counterOffer, user.type)
    this.job = job
    this.amount = this.job.budget
  }

  getMessage(executor?: string): string {
    return `'${executor}' proposed a counter offer.<br>
      Proposed budget at $${this.USD}${this.getPaymentTypeString()} (${this.CAN} CAN)`
  }
}
export class AcceptTermsAction extends IJobAction {
  constructor(user: User, job: Job) {
    super(ActionType.acceptTerms, user.type)
    this.job = job
  }

  getMessage(executor?: string): string {
    return `'${executor}' accepted the terms of this job.`
  }
}

export class DeclineTermsAction extends IJobAction {
  constructor(user: User, job: Job) {
    super(ActionType.declineTerms, user.type)
    this.job = job
  }

  getMessage(executor?: string): string {
    return `'${executor}' declined the terms of this job.`
  }
}

export class CancelJobAction extends IJobAction {
  constructor(user: User, job: Job) {
    super(ActionType.cancelJob, user.type)
    this.job = job
  }

  getMessage(executor?: string): string {
    return `'${executor}' cancelled this job.`
  }
}

export class AddMessageAction extends IJobAction {
  constructor(user: User, job: Job) {
    super(ActionType.addMessage, user.type)
    this.job = job
  }

  getMessage(executor?: string): string {
    return `'${executor}' left a message:<br>
      <em>${this.message}</em>`
  }
}

export class RaiseDisputeAction extends IJobAction {
  constructor(user: User, job: Job) {
    super(ActionType.dispute, user.type)
    this.job = job
  }
}

export class AuthoriseEscrowAction extends IJobAction {
  constructor(user: User, job: Job) {
    super(ActionType.authoriseEscrow, user.type)
    this.job = job
  }

  getMessage(executor?: string): string {
    return `'${executor}' authorised the Escrow contract to transfer $${this.USD} (${this.CAN} CAN)<br>
      Balance will be transferred to the provider when the job is finished.`
  }
}

export class EnterEscrowAction extends IJobAction {
  constructor(user: User, job: Job) {
    super(ActionType.enterEscrow, user.type)
    this.job = job
  }

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
