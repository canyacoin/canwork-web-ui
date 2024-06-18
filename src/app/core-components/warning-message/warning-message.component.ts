import { Component, Input } from '@angular/core';

@Component({
  selector: 'warning-message',
  templateUrl: './warning-message.component.html',
})
export class WarningMessageComponent {
  @Input() message!: string
  @Input() type: number
  show: boolean = true

  changeViewOption() {
    this.show =!this.show
  }
}
