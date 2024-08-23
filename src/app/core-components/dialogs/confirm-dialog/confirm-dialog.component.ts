import { Component, Input, Output, EventEmitter } from '@angular/core'

@Component({
  selector: 'confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
})
export class ConfirmDialogComponent {
  // two way data binding
  private _visible: boolean
  @Input()
  get visible(): boolean {
    return this._visible
  }
  set visible(value: boolean) {
    this._visible = value
    this.visibleChange.emit(this._visible)
  }
  @Output() visibleChange = new EventEmitter<boolean>()

  @Input() title: string
  @Input() content: string

  @Output() LeftbtnEvent = new EventEmitter<Event>()
  // @Output() RightbtnEvent = new EventEmitter<Event>()

  LeftClick(event: Event) {
    event.preventDefault()
    this.visible = false
    this.LeftbtnEvent.emit(event)
  }
  RightClick(event: Event) {
    event.preventDefault()
    this.visible = false
  }
}
