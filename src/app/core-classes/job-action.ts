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


  constructor(type: ActionType, executedBy: UserType, message?: string = '') {
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


  getMessage(executor?: string): string {
    switch (this.type) {
      case ActionType.createJob:
        return `Job created by ${executor}.<br>
        Proposed budget at $${this.amountUsd}${this.paymentTypeString} (${this.amountCan} CAN)
        for ${this.weeklyCommitment} hours a week
        for ${this.timelineExpectation}`;
      case ActionType.counterOffer:
        return `${executor} proposed a counter offer.<br>
        Proposed budget at $${this.amountUsd}${this.paymentTypeString} (${this.amountCan} CAN)`;
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
