import { Component, Input, Output, EventEmitter } from '@angular/core'

@Component({
  selector: 'see-more-less-button',
  templateUrl: './see-more-less-button.component.html',
})
export class SeeMoreLessButtonComponent {
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

  toggleContent() {
    this.visible = !this.visible
  }
}
