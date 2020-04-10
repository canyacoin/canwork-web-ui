import { Component, OnInit, OnDestroy } from '@angular/core'
import { BinanceService, Transaction } from '@service/binance.service'
import { ToastrService } from 'ngx-toastr'

@Component({
  selector: 'send-tx-modal',
  templateUrl: './send-tx-modal.component.html',
})
export class SendTxModalComponent implements OnInit, OnDestroy {
  private txSubscription?: any = null

  isConfirming: boolean = false
  fromAddress?: string = null
  transaction?: Transaction = null
  keystorePassword: string = ''
  isKeystorePasswordVisible: boolean = false

  constructor(
    private binanceService: BinanceService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    console.log('send tx modal')
    this.txSubscription = this.binanceService.transactionsEmitter.subscribe({
      next: (transaction: Transaction) => {
        this.isConfirming = false
        this.fromAddress = this.binanceService.getAddress()
        this.transaction = transaction
        this.keystorePassword = ''
        this.isKeystorePasswordVisible = this.binanceService.isKeystoreConnected()
        ;(window as any).$('#sendTxModal').modal('show')
      },
    })
  }

  ngOnDestroy() {
    if (this.txSubscription) {
      this.txSubscription.unsubscribe()
    }
    this.close()
  }

  splitMemo(memo) {
    if (!memo) {
      return ''
    }
    return memo.replace(/:/g, ':<BREAK>').split('<BREAK>')
  }

  private close() {
    ;(window as any).$('#sendTxModal').modal('hide')
  }

  private wrapBeforeTransaction(beforeTransaction: Function) {
    return function() {
      this.isConfirming = true
      if (this.binanceService.isLedgerConnected()) {
        this.toastr.info('Please approve on your ledger')
      } else if (this.binanceService.isWalletConnectConnected()) {
        this.toastr.info('Please approve on your WalletConnect')
      }
      if (beforeTransaction) {
        beforeTransaction.apply(this, arguments)
      }
    }
  }

  private wrapOnSuccess(onSuccess: Function) {
    return function() {
      this.isConfirming = false
      this.toastr.success('Successfully sent the transaction')
      this.close()
      if (onSuccess) {
        onSuccess.apply(this, arguments)
      }
    }
  }

  private wrapOnFailure(onFailure: Function) {
    return function(reason) {
      this.isConfirming = false
      let errorMessage = 'Transaction failed'
      if (reason) {
        errorMessage += `: ${reason}`
      }
      this.toastr.error(errorMessage)
      if (onFailure) {
        onFailure.apply(this, arguments)
      }
    }
  }

  confirmTransaction() {
    console.log('confirm Transaction')
    const { to, symbol, amountAsset, memo, callbacks } = this.transaction
    const { beforeTransaction, onSuccess, onFailure } = callbacks
    const wrappedBeforeTransaction = this.wrapBeforeTransaction(
      beforeTransaction
    ).bind(this)
    const wrappedOnSuccess = this.wrapOnSuccess(onSuccess).bind(this)
    const wrappedOnFailure = this.wrapOnFailure(onFailure).bind(this)
    if (this.binanceService.isLedgerConnected()) {
      this.binanceService.transactViaLedger(
        to,
        symbol,
        amountAsset,
        memo,
        wrappedBeforeTransaction,
        wrappedOnSuccess,
        wrappedOnFailure
      )
    } else if (this.binanceService.isKeystoreConnected()) {
      this.binanceService.transactViaKeystore(
        to,
        symbol,
        amountAsset,
        memo,
        this.keystorePassword,
        wrappedBeforeTransaction,
        wrappedOnSuccess,
        wrappedOnFailure
      )
    } else if (this.binanceService.isWalletConnectConnected()) {
      this.binanceService.transactViaWalletConnect(
        to,
        symbol,
        amountAsset,
        memo,
        wrappedBeforeTransaction,
        wrappedOnSuccess,
        wrappedOnFailure
      )
    } else {
      console.error('Unsupported wallet type')
      wrappedOnFailure('no supported wallet connected')
    }
  }
}
