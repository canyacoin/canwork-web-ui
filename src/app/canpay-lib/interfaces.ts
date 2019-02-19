export enum Step {
    paymentSummary = 0,
    metamask = 1,
    paymentAmount = 2,
    balanceCheck = 3,
    buyCan = 4,
    canexPaymentOptions = 5,
    canexErc20 = 6,
    canexQr = 7,
    canexProcessing = 8,
    canexReceipt = 9,
    canexError = 10,
    authorisation = 11,
    payment = 12,
    process = 13,
    confirmation = 14,
    completed = 15,
}

export enum Operation {
    auth = 'Authorise',
    pay = 'Pay',
    interact = 'Interact'
}

export enum ProcessAction {
    success = 0,
    error = 1
}

export enum View {
    Normal,
    Compact
}

export interface ProcessActionResult {
    type: ProcessAction;
    msg: string;
}

export interface Contract {
    abi: any;
    address: string;
}

export interface CanPay {
    dAppName: string;
    operation?: Operation;
    onAuthTxHash?: Function;
    onPaymentTxHash?: Function;
    recipient: string;
    amount?: number;
    paymentSummary?: PaymentSummary;
    minAmount?: number;
    maxAmount?: number;
    successText?: string;
    postAuthorisationProcessName?: string;
    postAuthorisationProcessResults?: ProcessActionResult;
    canyaContract?: Contract;
    startPostAuthorisationProcess?: Function;
    complete: Function;
    cancel?: Function;
    currentStep?: Function;
    disableCanEx?: boolean;
    destinationAddress?: string;
    userEmail?: string;
}

export interface PaymentSummary {
    currency: PaymentItemCurrency;
    items: Array<PaymentItem>;
    total: number;
}

export interface PaymentItem {
    name: string;
    value: number;
}

export enum PaymentItemCurrency {
    usd = '$USD',
    can = 'CAN'
}

export function setProcessResult(txOrErr) {
    this.postAuthorisationProcessResults = {
        type: !txOrErr.status ? ProcessAction.error : ProcessAction.success,
        msg: !txOrErr.status ? (txOrErr.message || 'Transaction failed') : null
    };
}

export interface CanPayData {
    currStep: Step;
    amount: number;
    account: string;
    balance: number;
}
