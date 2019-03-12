import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { PaymentItem, PaymentItemCurrency, PaymentSummary, Step } from '../interfaces';

@Component({
  selector: 'canyalib-payment-summary-template',
  templateUrl: './payment-summary-template.component.html',
  styleUrls: ['./payment-summary-template.component.scss']
})
export class PaymentSummaryTemplateComponent implements OnInit {
  @Input() paymentSummary: PaymentSummary = null;
  @Input() amount = 0;
  @Input() showBalance = false;
  @Input() balance = 0;

  constructor() { }

  ngOnInit() {
    if (!this.paymentSummary) {
      this.paymentSummary = {
        currency: PaymentItemCurrency.can,
        items: [{ name: 'Transfer', value: this.amount }],
        total: this.amount
      };
    }
  }

  get currencyIsUsd() {
    return this.paymentSummary.currency === PaymentItemCurrency.usd;
  }
  get currencyIsCan() {
    return this.paymentSummary.currency === PaymentItemCurrency.can;
  }

  get usdPerCan(): string {
    if (!this.amount || !this.paymentSummary.total) {
      return '?';
    }
    return (this.paymentSummary.total / this.amount).toPrecision(4).toString();
  }

}
