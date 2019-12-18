import { Component, OnInit, OnDestroy } from '@angular/core'
import { BinanceService, Transaction } from '@service/binance.service'

@Component({
  selector: 'send-tx-modal',
  templateUrl: './send-tx-modal.component.html',
})
export class SendTxModalComponent implements OnInit, OnDestroy {
  isConfirming: boolean = false
  private txSubscription?: any = null

  constructor(private binanceService: BinanceService) {}

  ngOnInit() {
    this.txSubscription = this.binanceService.transactionsEmitter.subscribe({
      next: (tx: Transaction) => {
        console.log(`Received tx: ${tx}`)
      },
    })
  }

  ngOnDestroy() {
    if (this.txSubscription) {
      this.txSubscription.unsubscribe()
    }
  }

  confirmTransaction() {}
}
