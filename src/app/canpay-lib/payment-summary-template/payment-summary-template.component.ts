import { BinanceService } from '@service/binance.service'
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'

import { formatAtomicAsset } from '@util/currency-conversion'

import { PaymentSummary } from '../interfaces'

@Component({
  selector: 'payment-summary-template',
  templateUrl: './payment-summary-template.component.html',
  styleUrls: ['./payment-summary-template.component.scss'],
})
export class PaymentSummaryTemplateComponent implements OnInit {
  @Input() paymentSummary: PaymentSummary = null
  @Input() amount = 0
  @Input() showBalance = false
  @Input() balance = 0

  paymentAssetIconURL: string

  constructor(private binanceService: BinanceService) {}

  ngOnInit() {
    if (!this.paymentSummary) {
      console.log('No Payment Summary')
    }

    this.binanceService
      .getAssetIconUrl(this.paymentSummary.asset.symbol)
      .then(iconURL => {
        this.paymentAssetIconURL = iconURL
      })
  }

  formatAmount() {
    return formatAtomicAsset(this.amount)
  }

  get usdPerCan(): string {
    if (!this.amount || !this.paymentSummary.job.usdValue) {
      return '?'
    }
    return ((this.paymentSummary.job.usdValue * 1e8) / this.amount)
      .toPrecision(4)
      .toString()
  }
}
