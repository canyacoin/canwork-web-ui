import { Component, Input } from '@angular/core';

@Component({
  selector: 'job-transaction-history',
  templateUrl: './job-transaction-history.component.html',
})
export class JobTransactionHistoryComponent {
  @Input() isAwaitingEscrow: boolean = false
}
