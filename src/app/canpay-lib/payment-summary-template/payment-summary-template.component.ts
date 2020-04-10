import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'

import { BinanceService } from '@service/binance.service'
import { PaymentSummary } from '../interfaces'

@Component({
  selector: 'payment-summary-template',
  templateUrl: './payment-summary-template.component.html',
  styleUrls: ['./payment-summary-template.component.scss'],
})
export class PaymentSummaryTemplateComponent implements OnInit {
  @Input() paymentSummary: PaymentSummary = null

  paymentAssetIconURL: string
  formatAssetJobBudget: string

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

    //Format the atomic asset job budget for readability
    this.formatAssetJobBudget = (
      this.paymentSummary.jobBudgetAtomic / 1e8
    ).toPrecision(4)
  }
}
