import { Component, Output, EventEmitter, Input } from '@angular/core'

@Component({
  selector: 'switch-grid-list-button',
  templateUrl: './switch-grid-list.component.html',
})
export class SwitchGridListComponent {
  @Input() isGrid!: boolean
  @Output() gridChanged = new EventEmitter<boolean>()

  setGrid() {
    if (this.isGrid !== true) this.gridChanged.emit(true) // Emit true when grid view is selected
  }

  setList() {
    if (this.isGrid !== false) this.gridChanged.emit(false) // Emit false when list view is selected
  }
}
