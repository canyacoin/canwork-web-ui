import { Component, OnInit, OnDestroy } from '@angular/core'
import { BinanceService, Transaction } from '@service/binance.service'
import { formatAtomicCan } from '@util/currency-conversion'

@Component({
  selector: 'send-tx-modal',
  templateUrl: './send-tx-modal.component.html',
})
export class SendTxModalComponent implements OnInit, OnDestroy {
  isConfirming: boolean = false
  private txSubscription?: any = null
  fromAddress?: string = null
  transaction?: Transaction = null

  constructor(private binanceService: BinanceService) {}

  ngOnInit() {
    this.txSubscription = this.binanceService.transactionsEmitter.subscribe({
      next: (transaction: Transaction) => {
        this.fromAddress = this.binanceService.getAddress()
        this.transaction = transaction
        ;(window as any).$('#sendTxModal').modal('show')
      },
    })
  }

  ngOnDestroy() {
    if (this.txSubscription) {
      this.txSubscription.unsubscribe()
    }
    ;(window as any).$('#sendTxModal').modal('hide')
  }

  formatAmount(amount) {
    return formatAtomicCan(amount)
  }

  splitMemo(memo) {
    if (!memo) {
      return ''
    }
    return memo.replace(/:/g, ':<BREAK>').split('<BREAK>')
  }

  confirmTransaction() {}
}
