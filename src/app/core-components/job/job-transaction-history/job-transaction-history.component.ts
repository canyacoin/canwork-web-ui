import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'job-transaction-history',
  templateUrl: './job-transaction-history.component.html',
})
export class JobTransactionHistoryComponent {
  @Input() isAwaitingEscrow: boolean = false
  @Output() leftBtnEvent = new EventEmitter<Event>()
  @Output() rightBtnEvent = new EventEmitter<Event>()
  
  leftClick(event: Event) {
    event.preventDefault()
    this.leftBtnEvent.emit(event)
  }
  rightClick(event: Event) {
    event.preventDefault()
    this.rightBtnEvent.emit(event)
  }
}
