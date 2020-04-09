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

    //Get payment asset icon
    this.binanceService
      .getAssetIconUrl(this.paymentSummary.asset.symbol)
      .then(iconURL => {
        this.paymentAssetIconURL = iconURL
      })

    console.log(this.paymentSummary.asset.jobBudgetAsset)
  }
}
