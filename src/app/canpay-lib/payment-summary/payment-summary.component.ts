import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { PaymentItem, PaymentItemCurrency, PaymentSummary, Step } from '../interfaces';

@Component({
  selector: 'canyalib-payment-summary',
  templateUrl: './payment-summary.component.html',
  styleUrls: ['./payment-summary.component.scss']
})
export class PaymentSummaryComponent implements OnInit {
  @Output() error = new EventEmitter();
  @Output() stepFinished = new EventEmitter();
  @Input() paymentSummary: PaymentSummary = null;
  @Input() amount = 0;

  isLoading = false;


  constructor() { }

  ngOnInit() {

  }

  next() {
    this.isLoading = true;
    this.stepFinished.emit();
  }

}
