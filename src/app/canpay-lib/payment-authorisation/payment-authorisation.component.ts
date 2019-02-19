import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { CanYaCoinEthService } from '../services/canyacoin-eth.service';

@Component({
  selector: 'canyalib-payment-authorisation',
  templateUrl: './payment-authorisation.component.html',
  styleUrls: ['./payment-authorisation.component.scss']
})
export class PaymentAuthorisationComponent implements OnInit, OnDestroy {
  @Output() error = new EventEmitter();
  @Output() warning = new EventEmitter();
  @Output() success = new EventEmitter();
  @Output() transactionSent = new EventEmitter();
  @Input() dAppName;
  @Input() recipient;
  @Input() onAuthTxHash = undefined;
  @Input() amount = 0;
  @Input() hasPostAuthProcess = true;

  isLoading = true;
  sendingTx = false;

  accSub: Subscription;

  constructor(private canyaCoinEthService: CanYaCoinEthService) { }

  async ngOnInit() {
    this.accSub = this.canyaCoinEthService.account$.subscribe(async (acc) => {
      const hasAllowance = await this.canyaCoinEthService.hasAllowance(acc, this.recipient, this.amount);
      if (hasAllowance) {
        this.success.emit('');
      } else if (this.isLoading) {
        const ethBal = await this.canyaCoinEthService.getEthBalanceAsync(acc);
        if (Number(ethBal) <= 0) {
          this.warning.emit('You do not have enough gas (ETH) to send this transaction');
        }
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.accSub) { this.accSub.unsubscribe(); }
  }

  authorise() {
    if (this.sendingTx) { return; }

    this.sendingTx = true;
    console.log('authCanPayment: ', this.recipient, this.amount);
    this.canyaCoinEthService.authoriseCANPayment(this.recipient, this.amount, undefined, this.onAuthTxHash)
      .then((tx) => {
        if (tx.status) {
          this.transactionSent.emit(tx); this.success.emit();
        } else {
          this.error.emit('Transaction failed');
        }
      })
      .catch(err => this.error.emit(err.message))
      .then(() => this.sendingTx = false);

    return false;
  }

}
