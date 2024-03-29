/*
export enum View {
  Normal,
  Compact,
}

export interface Contract {
  abi: any
  address: string
}
*/

/*
these are only declarations remaining from obsolete canpay-lib
used into cancel-job and buy-coffee

*/

export interface CanPay {
  paymentSummary?: PaymentSummary
  successText?: string
  complete: Function
  cancel?: Function
  initialisePayment?: Function
}

export interface PaymentSummary {
  asset: bepAssetData
  job: jobData
  jobBudgetAtomic: number
}

export interface jobData {
  name: string
  usdValue: number
  jobId?: string
  providerAddress?: string
}

export interface bepAssetData {
  symbol: string
  iconURL?: string
  freeAsset: number
  freeUsd: number
  usdPrice: number
}
