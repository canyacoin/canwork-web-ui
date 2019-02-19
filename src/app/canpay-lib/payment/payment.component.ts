import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';

import { CanYaCoinEthService } from '../services/canyacoin-eth.service';

@Component({
  selector: 'canyalib-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements AfterViewInit {
  @Output() error = new EventEmitter();
  @Output() warning = new EventEmitter();
  @Output() success = new EventEmitter();
  @Input() dAppName;
  @Input() recipient;
  @Input() amount = 0;
  @Input() totalTransactions = 1;
  @Input() onPaymentTxHash = undefined;
  sendingTx = false;

  constructor(private canyaCoinEthService: CanYaCoinEthService) { }

  async ngAfterViewInit() {
    const ethBal = await this.canyaCoinEthService.getEthBalanceAsync();
    if (Number(ethBal) <= 0) {
      this.warning.emit('You do not have enough gas (ETH) to send this transaction');
    } else if (Number(ethBal) <= 0.01) {
      this.warning.emit('You might not have enough gas (ETH) to send this transaction');
    }
  }

  pay() {
    if (this.sendingTx) { return; }

    this.sendingTx = true;
    this.canyaCoinEthService.payWithCAN(this.recipient, this.amount, undefined, this.onPaymentTxHash)
      .then(tx => tx.status === true ? this.success.emit(tx) : this.error.emit('Transaction failed'))
      .catch(err => this.error.emit(err.message))
      .then(() => this.sendingTx = false);

    return false;
  }
}
