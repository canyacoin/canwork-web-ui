import { Upload } from './upload';

export class Job {
    id: string;
    clientId: string;
    providerId: string;
    information: JobDescription;
    paymentType: PaymentType;
    budget: number;
    paymentLog: Array<Payment> = [];
    disputeLog: Array<DisputeItem> = [];
    boostVisibility = false;

    constructor(init?: Partial<Job>) {
        Object.assign(this, init);
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

export enum Payment {

}

export enum DisputeItem {

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

