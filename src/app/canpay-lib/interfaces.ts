export enum View {
  Normal,
  Compact,
}

export interface Contract {
  abi: any
  address: string
}

export interface CanPay {
  amount?: number
  paymentSummary?: PaymentSummary
  successText?: string
  complete: Function
  cancel?: Function
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

export interface CanPayData {
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
