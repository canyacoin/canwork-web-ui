import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'

import { formatAtomicCan } from '@util/currency-conversion'

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

  constructor() {}

  ngOnInit() {
    if (!this.paymentSummary) {
      console.log('No Payment Summary')
    }
  }

  formatAmount() {
    return formatAtomicCan(this.amount)
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
