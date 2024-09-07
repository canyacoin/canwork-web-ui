import { Component, Input, EventEmitter, Output } from '@angular/core'

@Component({
  selector: 'table-contents-card',
  templateUrl: './table-contents-card.component.html',
})
export class TableContentsCardComponent {
  @Input() headingsArray: string[] = []
  @Input() headingsIdArray: string[] = []
  @Output() headingClick: EventEmitter<string> = new EventEmitter

  handleHeadingClick(id: string) {
    this.headingClick.emit(id)
  }
}
