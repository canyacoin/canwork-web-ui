import { Component, Input, Output, EventEmitter } from '@angular/core'
import { Bid } from '@class/job'

@Component({
  selector: 'proposal-details-dialog',
  templateUrl: './proposal-details-dialog.component.html',
})
export class ProposalDetailsDialogComponent {
  // two way data binding
  _visible: boolean
  @Input()
  get visible(): boolean {
    return this._visible
  }
  set visible(value: boolean) {
    this._visible = value
    this.visibleChange.emit(this._visible)
    // console.log('issue: ', this._visible)
  }
  @Output() visibleChange = new EventEmitter<boolean>()

  @Input() selectedBid!: Bid

  @Output() declinetBtnEvent = new EventEmitter<Event>()
  @Output() accpetBtnEvent = new EventEmitter<Event>()

  declineClick(event: Event) {
    this.declinetBtnEvent.emit(event)
  }
  acceptClick(event: Event) {
    this.accpetBtnEvent.emit(event)
  }
}
