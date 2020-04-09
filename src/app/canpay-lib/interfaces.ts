export enum View {
  Normal,
  Compact,
}

export interface Contract {
  abi: any
  address: string
}

export interface CanPay {
  paymentSummary?: PaymentSummary
  successText?: string
  complete: Function
  cancel?: Function
  initialisePayment?: Function
}

export interface PaymentSummary {
  asset: BepAssetPaymentData
  job: jobData
}

export interface jobData {
  name: string
  usdValue: number
  jobId?: string
  providerAddress?: string
}

export interface BepAssetPaymentData {
  symbol: string
  freeAsset: number
  usdValue: number
  usdPrice: number
  jobBudgetAsset: number
}
