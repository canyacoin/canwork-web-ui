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
  selector: 'payment-summary',
  templateUrl: './payment-summary.component.html',
  styleUrls: ['./payment-summary.component.scss'],
})
export class PaymentSummaryComponent implements OnInit {
  @Output() error = new EventEmitter()
  @Output() stepFinished = new EventEmitter()
  @Input() paymentSummary: PaymentSummary = null
  @Input() amount = 0
  @Input() startJob
  @Input() initialisePayment

  isLoading = false

  constructor(
    private binanceService: BinanceService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {}

  next() {
    const beforeTransaction = () => {
      this.isLoading = true
    }

    const onSuccess = () => {
      this.stepFinished.emit()
    }

    const onFailure = () => {
      this.isLoading = false
    }

    this.initialisePayment(beforeTransaction, onSuccess, onFailure)
  }
}
