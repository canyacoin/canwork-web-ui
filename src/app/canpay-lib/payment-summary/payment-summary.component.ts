import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { BinanceService } from '@service/binance.service'

import {
  PaymentItem,
  PaymentItemCurrency,
  PaymentSummary,
  Step,
} from '../interfaces'

@Component({
  selector: 'canyalib-payment-summary',
  templateUrl: './payment-summary.component.html',
  styleUrls: ['./payment-summary.component.scss'],
})
export class PaymentSummaryComponent implements OnInit {
  @Output() error = new EventEmitter()
  @Output() stepFinished = new EventEmitter()
  @Input() paymentSummary: PaymentSummary = null
  @Input() amount = 0

  isLoading = false

  constructor(private binanceService: BinanceService) {}

  ngOnInit() {}

  next() {
    const amountCan = this.amount

    const paymentItem = this.paymentSummary.items[0]
    const { jobId, providerAddress } = paymentItem
    const jobPriceUsd = paymentItem.value

    this.binanceService.escrowViaLedger(
      jobId,
      jobPriceUsd,
      amountCan,
      providerAddress
    )
    // TODO remove
    // this.isLoading = true
    // this.stepFinished.emit()
  }
}
