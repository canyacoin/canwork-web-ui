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

  message: string;

  isClientSatisfied: boolean

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

  setPaymentProperties(usdVal: number, canVal: number, timelineExpectation?: TimeRange, workType?: WorkType, weeklyCommitment?: number, paymentType?: PaymentType) {
    this.amountUsd = usdVal;
    this.amountCan = canVal;
    this.timelineExpectation = timelineExpectation;
    this.workType = workType;
    this.weeklyCommitment = weeklyCommitment;
    this.paymentType = paymentType;
  }


  get paymentTypeString(): string {
    return this.paymentType && this.paymentType === PaymentType.hourly ? '/hr' : '/total'
  }

  get dialogMessage(): string {
    // TODO: Ensure these messages are correct
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

  /** Helper method to get the colour associated with each action button */
  get colour(): string {
    switch (this.type) {
      case ActionType.cancelJob:
      case ActionType.dispute:
        return 'danger';
      case ActionType.declineTerms:
        return 'danger';
      case ActionType.counterOffer:
      case ActionType.addMessage:
        return 'info';
      case ActionType.acceptTerms:
      case ActionType.authoriseEscrow:
      case ActionType.enterEscrow:
      case ActionType.finishedJob:
      case ActionType.acceptFinish:
        return 'success';
      default:
        return 'info';
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
