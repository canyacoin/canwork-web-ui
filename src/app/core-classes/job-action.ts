import { PaymentType, TimeRange, WorkType } from '@class/job';
import { UserType } from '@class/user';

import * as moment from 'moment';

export class IJobAction {
  type: ActionType;
  executedBy: UserType;
  timestamp: string;
  private: boolean;
  emailSent: boolean;

  message: string;

  rating: number;

  amountUsd: number;
  amountCan: number;
  workType: WorkType;
  timelineExpectation: TimeRange;
  weeklyCommitment: number;
  paymentType: PaymentType;


  constructor(type: ActionType, executedBy: UserType, message = '') {
    this.type = type;
    this.executedBy = executedBy;
    this.message = message;
    this.timestamp = moment().format('x');
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
    Object.assign(this, init);
    return this;
  }

  setPaymentProperties(usdVal: number, canVal: number, timelineExpectation?: TimeRange, workType?: WorkType, weeklyCommitment?: number, paymentType?: PaymentType) {
    this.amountUsd = usdVal;
    this.amountCan = canVal;
    this.timelineExpectation = timelineExpectation;
    this.workType = workType;
    this.weeklyCommitment = weeklyCommitment;
    this.paymentType = paymentType;
  }


  get paymentTypeString(): string {
    return this.paymentType && this.paymentType === PaymentType.hourly ? '/hr' : '/total';
  }

  get dialogMessage(): string {
    switch (this.type) {
      case ActionType.cancelJob:
        return 'Are you sure you wish to cancel this job?';
      case ActionType.declineTerms:
        return 'Once you decline these terms, the job will be cancelled and no further action can be performed on it.' +
          ' Are you sure you wish to decline the terms?';
      case ActionType.counterOffer:
        return 'If you wish to make a counter offer, enter the amount you propose for the job<br/>\nUSD' + this.paymentTypeString;
      case ActionType.acceptTerms:
        return 'Are you sure?';
      case ActionType.authoriseEscrow:
        return 'You are about to pay the agreed amount of CAN to the escrow. Are you sure?';
      case ActionType.enterEscrow:
        return 'This will create a relationship between the provider address and your address in the escrow contract.';
      case ActionType.addMessage:
        return 'Add a note to this job.';
      case ActionType.finishedJob:
        return 'Are you sure you\'ve finished your job?';
      case ActionType.acceptFinish:
        return 'Are you sure you want to finish this job?';
      case ActionType.review:
        return '';
      default:
        return 'Are you sure?';
    }
  }

  getMessage(executor?: string): string {
    switch (this.type) {
      case ActionType.createJob:
        return `Job created by ${executor}.<br>
          Proposed ${this.amountUsd ? `budget at $${this.amountUsd}${this.paymentTypeString} (${this.amountCan} CAN)` : ''}
          for ${this.weeklyCommitment} hours a week
          for ${this.timelineExpectation}`;
      case ActionType.counterOffer:
        return `${executor} proposed a counter offer.<br>
          Proposed budget at $${this.amountUsd}${this.paymentTypeString} (${this.amountCan} CAN)`;
      case ActionType.acceptTerms:
        return `${executor} accepted the terms of this job.`;
      case ActionType.declineTerms:
        return `${executor} declined the terms of this job.`;
      case ActionType.addMessage:
        return `${executor} left a message:<br>
              <em>${this.message}</em>`;
      case ActionType.declineTerms:
        return `${executor} cancelled this job.`;
      case ActionType.authoriseEscrow:
        return `${executor} authorised the Escrow contract to transfer ${this.amountCan} CAN`;
      case ActionType.enterEscrow:
        return `${executor} registered this job in the Escrow contract.<br>
              When the job is succesfully delivered, ${executor} will release the funds stored in the contract.`;
      default:
        return `Job action: ${this.type}, by ${executor}`;
    }
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
  addMessage = 'Add Note',
  finishedJob = 'Mark as complete',
  acceptFinish = 'Complete job',
  dispute = 'Raise dispute',
  review = 'Leave a review',
}
