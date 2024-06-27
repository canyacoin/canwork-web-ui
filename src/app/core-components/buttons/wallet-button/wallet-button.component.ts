import { Component, Input } from '@angular/core'

@Component({
  selector: 'wallet-button',
  templateUrl: './wallet-button.component.html',
})
export class WalletButtonComponent {
  @Input() type!: number
}
