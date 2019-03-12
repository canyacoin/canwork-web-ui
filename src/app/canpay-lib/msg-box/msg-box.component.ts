import { Component, EventEmitter, Input, Output } from '@angular/core';

export enum View {
  horizontal,
  vertical
}

@Component({
  selector: 'canyalib-msg-box',
  templateUrl: './msg-box.component.html',
  styleUrls: ['./msg-box.component.css']
})
export class MsgBoxComponent {
  @Output() action = new EventEmitter();
  @Input() msg: any;
  @Input() view: View = View.vertical;
  @Input() controls: any;

  View = View;

  constructor() {
    if (this.view === View.horizontal) {
      window.scrollTo(0, 0);
    }
  }

  cancel() {
    this.action.emit('cancel');
  }

  ok() {
    this.action.emit('ok');
  }

  clear() {
    this.msg = {};
  }

}
