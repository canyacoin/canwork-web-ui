import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'canyalib-input-amount',
  templateUrl: './input-amount.component.html',
  styleUrls: ['./input-amount.component.scss']
})
export class InputAmountComponent {
  @Output() amountUpdate = new EventEmitter();
  @Output() error = new EventEmitter();
  @Input() minAmount = 1;
  @Input() maxAmount = 0;
  amount: number;

  constructor() {
  }
  onAmountKeyUp(event) {
    this.amount = Number(event.target.value);
  }

  setAmount() {
    const amount = Number(this.amount);
    if (isNaN(amount) || amount < this.minAmount || (this.maxAmount && amount > this.maxAmount)) {
      const minAmountMsg = this.minAmount ? ', min allowed amount is ' + this.minAmount + ' CAN' : '';
      const maxAmountMsg = this.maxAmount ? ', max allowed amount is ' + this.maxAmount + ' CAN.' : '.';
      this.error.emit('Invalid payment amount' + minAmountMsg);
      return;
    }

    this.error.emit();
    this.amountUpdate.emit(amount);
  }
}
