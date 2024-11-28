import { Component, Input, Output, EventEmitter } from '@angular/core'

@Component({
  selector: 'basic-dialog',
  templateUrl: './basic-dialog.component.html',
})
export class BasicDialogComponent {
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

  @Input() jobId: string
  @Input() title: string
  @Input() content: string
  @Input() type: string

  @Output() LeftbtnEvent = new EventEmitter<Event>()
  @Output() RightbtnEvent = new EventEmitter<Event>()

  LeftClick(event: Event) {
    event.preventDefault()
    this.LeftbtnEvent.emit(event)
  }
  RightClick(event: Event) {
    event.preventDefault()
    this.RightbtnEvent.emit(event)
  }

  handleCancelClick(event: Event): void {
    event.preventDefault()
    this.visible = false
  }
}
