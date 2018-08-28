import * as moment from 'moment';
import { UserType } from './user';
import { Job } from '@class/job';
import { User } from '@class/user';

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

  getMessage?(): string {
    return `Job action: ${this.type}`
  }
}

export class CreateJobAction extends IJobAction {
  constructor(user: User, job: Job) {
    super(ActionType.createJob, user.type);
    this.job = job
  }

  getMessage(): string {
    console.log(this.job)
    return `Proposed budget at CAN BUDGET`
  }
}

export class CounterOfferAction extends IJobAction {
  amount: number;

  constructor(executedBy: UserType, amount: number) {
    super(ActionType.counterOffer, executedBy);
    this.amount = amount;
  }
}

export class AddMessageAction extends IJobAction {
  message: string;

  constructor(executedBy: UserType, message: string) {
    super(ActionType.addMessage, executedBy);
    this.message = message;
  }
}

export class RaiseDisputeAction extends IJobAction {
  message: string;

  constructor(executedBy: UserType, message: string) {
    super(ActionType.dispute, executedBy);
    this.message = message;
  }
}

export class AuthoriseEscrowAction extends IJobAction {
  txId: string;
  amountCan: number;

  constructor(executedBy: UserType, txId: string, amountCan: number) {
    super(ActionType.authoriseEscrow, executedBy);
    this.txId = txId;
    this.amountCan = amountCan;
  }
}

export class EnterEscrowAction extends IJobAction {
  txId: string;
  amountCan: number;

  constructor(executedBy: UserType, txId: string, amountCan: number) {
    super(ActionType.enterEscrow, executedBy);
    this.txId = txId;
    this.amountCan = amountCan;
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
