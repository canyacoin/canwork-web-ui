import { Component, Input, Output, EventEmitter } from '@angular/core'

@Component({
  selector: 'basic-dialog',
  templateUrl: './basic-dialog.component.html',
})
export class BasicDialogComponent {
  @Input() visible: boolean
  @Input() title: string
  @Input() content: string
  @Input() type: string
  @Input() slug!: string

  @Output() LeftbtnEvent = new EventEmitter<Event>()
  @Output() RightbtnEvent = new EventEmitter<Event>()

  DeleteJob(event: Event) {
    this.LeftbtnEvent.emit(event)
  }
  Cancel(event: Event) {
    this.RightbtnEvent.emit(event)
  }
}
