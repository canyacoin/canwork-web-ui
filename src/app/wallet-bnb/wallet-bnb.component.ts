import { Component, OnInit, OnDestroy } from '@angular/core'
import { BinanceService } from '@service/binance.service'

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
export class WalletBnbComponent implements OnInit, OnDestroy {
  selected: Wallet = Wallet.Connect
  Wallet = Wallet

  constructor(private binanceService: BinanceService) {}

  ngOnInit() {}

  ngOnDestroy() {
    this.binanceService.disconnect()
  }

  isActive(wallet: Wallet): boolean {
    return this.selected == wallet
  }

  async connectWalletConnect() {
    const account = await this.binanceService.connectWalletConnect()
    console.log(account)
  }
}
