import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'

@Component({
  selector: 'connect-wallet-dialog',
  templateUrl: './connect-wallet.component.html',
})
export class ConnectWalletDialogComponent implements OnInit {
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

  ngOnInit() {
    if (this.visible === true) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'auto'
  }

  closeModal(): void {
    document.body.style.overflow = 'auto'
    this._visible = false
    this.visibleChange.emit(this._visible)
  }
}
