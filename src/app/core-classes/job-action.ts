import * as moment from 'moment';
import { UserType } from './user';

export class IJobAction {
    type: ActionType;
    executedBy: UserType;
    timestamp: string;
    private: boolean;
    emailSent: number;

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
    enterEscrow = 'Add funds to escrow',
    addMessage = 'Add message',
    finishedJob = 'Mark as complete',
    acceptFinish = 'Complete job',
    dispute = 'Raise dispute'
}
