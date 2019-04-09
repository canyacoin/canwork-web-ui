import { UserType } from '@class/user';
import { IJobAction } from './job-action';
import { Upload } from './upload';

export class Job {
  id: string;
  hexId: string;
  clientId: string;
  providerId: string;
  clientEthAddress: string;
  information: JobDescription;
  paymentType: PaymentType;
  budget: number;
  budgetCan: number;
  daiInEscrow: number;
  paymentLog: Array<Payment> = [];
  state: JobState;
  actionLog: Array<IJobAction> = [];
  boostVisibility = false;
  reviewId: string;
  deadline: string;
  visibility: string;
  draft: boolean;
  slug: string;
  createAt: number;
  updateAt: number;
  fiatPayment: boolean;
  constructor(init?: Partial<Job>) {
    Object.assign(this, init);
  }

  get parsedActionLog() {
    return this.actionLog.map(actionObj => {
      const action = new IJobAction(actionObj.type, actionObj.executedBy);
      return action.init(actionObj);
    });
  }

  /* For the explanation modal */
  getStateExplanation(currentUserType: UserType): string {
    switch (this.state) {
      case JobState.offer:
        return 'A client has offered a job to a provider and is awaiting the provider\'s acceptance';
      case JobState.workPendingCompletion:
        return 'The provider has marked the job as complete and is awaiting the client\'s acceptance';
      case JobState.cancelled:
        return currentUserType === UserType.client ? 'You cancelled this job.' : 'This job has been cancelled by the client';
      case JobState.declined:
        return 'This job offer was turned down by the provider';
      case JobState.inDispute:
        return 'The provider or the client has raised a dispute. This is being resolved by the CanYa DAO';
      case JobState.providerCounterOffer:
        return 'The provider has countered the client\'s offer';
      case JobState.clientCounterOffer:
        return 'The client has countered the provider\'s offer';
      case JobState.termsAcceptedAwaitingEscrow:
        return currentUserType === UserType.client ?
          'The job\'s terms has been accepted. You can now send the agreed amount of money to the escrow to commence the job.'
          : 'You have agreed to the terms and conditions of this job, you will need to wait for the client to send the funds to escrow.';
      case JobState.complete:
        return 'This job has been marked as complete by the client.';
      case JobState.authorisedEscrow:
        return 'The escrow has been authorised by the client, they can now send the funds to escrow.';
      case JobState.inEscrow:
        return 'The funds has been deposited in the escrow! you can now commence the job.';
      case JobState.reviewed:
        return 'Both parties have completed the job, and a review has been left for the provider!';
      case JobState.processingEscrow:
        return 'Payment is process. Please wait.';
      case JobState.finishingJob:
        return 'Finalizing Job. Please wait.';
      default:
        return '';
    }
  }
}

export class JobDescription {
  description: string;
  title: string;
  initialStage: string;
  skills: Array<string> = [];
  attachments: Array<Upload> = [];
  workType: WorkType;
  timelineExpectation: TimeRange;
  weeklyCommitment: number;
  providerType: string;

  constructor(init?: Partial<JobDescription>) {
    Object.assign(this, init);
  }
}

export class Bid {
  providerId: string;
  providerInfo: Object;
  budget: number;
  message: string;
  timestamp: string;
  rejected: boolean;
  constructor(providerId: string, providerInfo: Object, budget: number, message: string, timestamp: string) {
    this.providerId = providerId;
    this.providerInfo = providerInfo;
    this.budget = budget;
    this.message = message;
    this.timestamp = timestamp;
    this.rejected = false;
  }
}

export class Payment {
  txId: string;
  timestamp: string;
  amountCan: number;

  constructor(init?: Partial<Payment>) {
    Object.assign(this, init);
  }
}

export enum JobState {
  acceptingOffers = 'Accepting Offers',
  closed = 'Public job closed',
  offer = 'Offer pending',
  cancelled = 'Cancelled',
  declined = 'Declined',
  providerCounterOffer = 'Provider counter',
  clientCounterOffer = 'Client counter',
  termsAcceptedAwaitingEscrow = 'Awaiting Escrow',
  authorisedEscrow = 'Funds In Escrow',
  processingEscrow = 'Processing Escrow',
  finishingJob = 'Finishing Job',
  inEscrow = 'Job started',
  workPendingCompletion = 'Pending completion',
  inDispute = 'Disputed',
  complete = 'Complete',
  reviewed = 'Review added',
  draft = 'Draft'
}

export enum WorkType {
  oneOff = 'One off',
  ongoing = 'Ongoing'
}

export enum TimeRange {
  oneWeek = 'Less than 1 Week',
  oneToTwoWeeks = '1-2 Weeks',
  twoToFourWeeks = '2-4 Weeks',
  oneMonth = '1 Month',
  oneToTwoMonths = '1-2 Months',
  twoToFourMonths = '2-4 Months',
  fourToSixMonths = '4-6 Months',
  upToYear = 'Up to 1 Year'
}

export enum PaymentType {
  hourly = 'Hourly rate',
  fixed = 'Fixed price'
}


