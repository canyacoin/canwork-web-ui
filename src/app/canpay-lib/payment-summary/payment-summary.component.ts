import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { BinanceService } from '@service/binance.service'
import { ToastrService } from 'ngx-toastr'

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

  constructor(
    private binanceService: BinanceService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {}

  next() {
    const amountCan = this.amount

    const paymentItem = this.paymentSummary.items[0]
    const { jobId, providerAddress } = paymentItem
    const jobPriceUsd = paymentItem.value

    const beforeTransaction = () => {
      this.toastr.info('Please approve on your ledger')
    }

    const onSuccess = () => {
      console.log('Success')
    }

    const onFailure = () => {
      this.toastr.error('Transaction failed')
    }

    this.binanceService.escrowViaLedger(
      jobId,
      jobPriceUsd,
      amountCan,
      providerAddress,
      beforeTransaction,
      onSuccess,
      onFailure
    )
    // TODO remove
    // this.isLoading = true
    // this.stepFinished.emit()
  }
}
