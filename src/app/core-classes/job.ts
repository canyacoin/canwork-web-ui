import { IJobAction, ActionType, CreateJobAction, CounterOfferAction, AddMessageAction, RaiseDisputeAction, AuthoriseEscrowAction, EnterEscrowAction, AcceptTermsAction, DeclineTermsAction, CancelJobAction } from './job-action';
import { Upload } from './upload';

export class Job {
  id: string;
  hexId: string;
  clientId: string;
  providerId: string;
  information: JobDescription;
  paymentType: PaymentType;
  budget: number;
  budgetCan: number;
  canInEscrow: number;
  paymentLog: Array<Payment> = [];
  state: JobState;
  actionLog: Array<IJobAction> = [];
  boostVisibility = false;

  constructor(init?: Partial<Job>) {
    Object.assign(this, init);
  }

  getAction(action: IJobAction): IJobAction {
    const actions = {}

    actions[ActionType.createJob] = CreateJobAction
    actions[ActionType.cancelJob] = CancelJobAction
    actions[ActionType.declineTerms] = DeclineTermsAction
    actions[ActionType.counterOffer] = CounterOfferAction
    actions[ActionType.acceptTerms] = AcceptTermsAction
    actions[ActionType.authoriseEscrow] = AuthoriseEscrowAction
    actions[ActionType.enterEscrow] = EnterEscrowAction
    actions[ActionType.addMessage] = AddMessageAction
    // actions[ActionType.finishedJob] =
    // actions[ActionType.acceptFinish] =
    // actions[ActionType.dispute] = RaiseDisputeAction

    return actions[action.type] ? new actions[action.type](action.executedBy, this) : new IJobAction(action.type, action.executedBy)
  }

  getActionLog() {
    return this.actionLog.map(actionObj => {
      const action = this.getAction(actionObj)
      return action.init(actionObj)
    })
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

  constructor(init?: Partial<JobDescription>) {
    Object.assign(this, init);
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
  offer = 'Offer pending',
  cancelled = 'Cancelled',
  declined = 'Declined',
  providerCounterOffer = 'Provider counter',
  clientCounterOffer = 'Client counter',
  termsAcceptedAwaitingEscrow = 'Awaiting Escrow',
  authorisedEscrow = 'Funds In Escrow',
  inEscrow = 'Job started',
  workPendingCompletion = 'Pending completion',
  inDispute = 'Disputed',
  complete = 'Complete'
}

export enum WorkType {
  oneOff = 'One off',
  ongoing = 'Ongoing'
}

export enum TimeRange {
  oneWeek = '1 Week',
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

