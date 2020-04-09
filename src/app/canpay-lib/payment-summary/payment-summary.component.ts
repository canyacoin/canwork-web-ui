import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { BinanceService } from '@service/binance.service'
import { ToastrService } from 'ngx-toastr'

import { PaymentSummary } from '../interfaces'

@Component({
  selector: 'payment-summary',
  templateUrl: './payment-summary.component.html',
  styleUrls: ['./payment-summary.component.scss'],
})
export class PaymentSummaryComponent implements OnInit {
  @Output() error = new EventEmitter()
  @Input() paymentSummary: PaymentSummary = null
  @Input() initialisePayment

  isLoading = false

  constructor(
    private binanceService: BinanceService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    console.log('Payment Summary: ')
    console.log(this.paymentSummary)
  }

  next() {
    console.log('NEXT')
    const beforeTransaction = () => {
      console.log('beforeTransaction')
      this.isLoading = true
    }

    const onSuccess = () => {
      console.log('onSuccess')
    }

    const onFailure = () => {
      console.log('onFailure')
      this.isLoading = false
    }

    this.initialisePayment(beforeTransaction, onSuccess, onFailure)
  }
}
