import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  Renderer2,
  AfterViewInit,
} from '@angular/core'
import { Transaction } from '@service/transaction.service'
import { environment } from 'environments/environment'
import { UserType } from '@class/user'

import { trigger, state, style, transition, animate } from '@angular/animations'

@Component({
  selector: 'job-transaction-history-panel',
  templateUrl: './job-transaction-history-panel.component.html',
  animations: [
    trigger('toggleHeight', [
      state(
        'collapsed',
        style({
          height: '260px',
          overflow: 'hidden',
        })
      ),
      state(
        'expanded',
        style({
          height: '*',
        })
      ),
      transition('collapsed <=> expanded', [animate('150ms')]),
    ]),
  ],
})
export class JobTransactionHistoryPanelComponent implements AfterViewInit {
  @ViewChild('contentDiv') contentDiv: ElementRef
  @Input() isAwaitingEscrow: boolean = false
  @Input() transactions: Transaction[] = []
  @Input() currentUserType: UserType
  @Output() leftBtnEvent = new EventEmitter<Event>()
  @Output() rightBtnEvent = new EventEmitter<Event>()

  userType = UserType

  isSeeMore: boolean = false
  isHeightMoreThan259px: boolean = false

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit() {
    this.checkHeight()
  }

  checkHeight() {
    if (this.contentDiv) {
      const height = this.contentDiv.nativeElement.offsetHeight
      this.isHeightMoreThan259px = height > 259
    }
  }

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
