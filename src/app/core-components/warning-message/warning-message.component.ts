import { Component, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'warning-message',
  templateUrl: './warning-message.component.html',
})
export class WarningMessageComponent {
  @Input() message: string
  @Input() type: number
  @Input() budget: number = 0

  @Output() buttonClick = new EventEmitter() // Use specific type instead of any if possible

  show: boolean = true

  changeViewOption() {
    this.show =!this.show
  }

  handleClick(event: Event): void {
    event.preventDefault()
    this.buttonClick.emit()
  }
}
