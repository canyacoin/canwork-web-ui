import { Component, Input, Output, EventEmitter } from '@angular/core'
import { Transaction } from '@service/transaction.service'
import { environment } from 'environments/environment'

@Component({
  selector: 'job-transaction-history',
  templateUrl: './job-transaction-history.component.html',
})
export class JobTransactionHistoryComponent {
  @Input() isAwaitingEscrow: boolean = false
  @Input() transactions: Transaction[] = []
  @Output() leftBtnEvent = new EventEmitter<Event>()
  @Output() rightBtnEvent = new EventEmitter<Event>()

  getTxLink(txHash: string) {
    return `${environment.bsc.blockExplorerUrls[0]}/tx/${txHash}`
  }

  getTxColor(tx: Transaction) {
    return 'success' // default
    /* 
    todo: there are failure scenarios that we should handle?
    if so we have to handle into bsc service and handle tx timeout, cause receipt will not arrive
    */
    // return tx.success ? 'success' : tx.failure ? 'danger' : 'warning' // obsolete
  }

  leftClick(event: Event) {
    event.preventDefault()
    this.leftBtnEvent.emit(event)
  }
  rightClick(event: Event) {
    event.preventDefault()
    this.rightBtnEvent.emit(event)
  }
}
