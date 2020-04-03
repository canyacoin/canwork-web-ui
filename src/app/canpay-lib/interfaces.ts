export enum Step {
  paymentSummary = 0,
  process = 13,
  confirmation = 14,
  completed = 15,
}

export enum Operation {
  auth = 'Authorise',
  pay = 'Pay',
  interact = 'Interact',
}

export enum ProcessAction {
  success = 0,
  error = 1,
}

export enum View {
  Normal,
  Compact,
}

export interface ProcessActionResult {
  type: ProcessAction
  msg: string
}

export interface Contract {
  abi: any
  address: string
}

export interface CanPay {
  operation?: Operation
  amount?: number
  paymentSummary?: PaymentSummary
  successText?: string
  postAuthorisationProcessName?: string
  postAuthorisationProcessResults?: ProcessActionResult
  startPostAuthorisationProcess?: Function
  complete: Function
  cancel?: Function
  currentStep?: Function
  userEmail?: string
  startJob?: Function
  initialisePayment?: Function
}

export interface PaymentSummary {
  currency: PaymentItemCurrency
  items: Array<PaymentItem>
  total: number
}

export interface PaymentItem {
  name: string
  value: number
  jobId?: string
  providerAddress?: string
}

export enum PaymentItemCurrency {
  usd = '$USD',
  can = 'CAN',
}

export function setProcessResult(txOrErr) {
  this.postAuthorisationProcessResults = {
    type: !txOrErr.status ? ProcessAction.error : ProcessAction.success,
    msg: !txOrErr.status ? txOrErr.message || 'Transaction failed' : null,
  }
}

export interface CanPayData {
  currStep: Step
  amount: number
  account: string
  balance: number
}

export interface BepAssetPaymentData {
  symbol: string
  freeAsset: number
  usdValue: number
  usdPrice: number
}
