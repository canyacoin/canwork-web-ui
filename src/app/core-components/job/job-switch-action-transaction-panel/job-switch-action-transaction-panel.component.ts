import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { Job } from '@class/job'
import { User, UserType } from '@class/user'
import { Tab } from '@class/tabs'
import { Transaction } from '@service/transaction.service'

@Component({
  selector: 'job-switch-action-transaction-panel',
  templateUrl: './job-switch-action-transaction-panel.component.html',
})
export class JobSwitchActionTransactionPanelComponent implements OnInit {
  // For Action-log
  @Input() isTabMode: boolean = true
  @Input() job!: Job
  @Input() currentUser!: User
  @Input() isAwaitingEscrow!: boolean
  // For Transaction
  @Input() transactions!: Transaction[]
  @Input() currentUserType!: UserType
  @Output() leftBtnEvent = new EventEmitter<Event>()
  @Output() rightBtnEvent = new EventEmitter<Event>()

  actionTabs: Tab[] = [
    { label: 'Action Log', code: 'action' },
    { label: 'Transaction History', code: 'transaction' },
  ]
  selectedTab: Tab

  ngOnInit() {
    this.selectedTab = this.actionTabs[0]
  }

  changeTab(item: Tab) {
    this.selectedTab = item
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
