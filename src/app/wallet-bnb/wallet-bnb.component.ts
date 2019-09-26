import { Component, OnInit } from '@angular/core'

enum Wallet {
  Connect,
  Ledger,
  Keystore,
  Mnemonic,
}

@Component({
  selector: 'app-wallet-bnb',
  templateUrl: './wallet-bnb.component.html',
  styleUrls: ['./wallet-bnb.component.css'],
})
export class WalletBnbComponent implements OnInit {
  selected: Wallet = Wallet.Connect
  Wallet = Wallet

  constructor() {}

  ngOnInit() {}
  isActive(wallet: Wallet): boolean {
    return this.selected == wallet
  }
}
