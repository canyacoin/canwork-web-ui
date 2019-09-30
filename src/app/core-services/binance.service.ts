import { Injectable } from '@angular/core'
import WalletConnect from '@trustwallet/walletconnect'

export type Connector = WalletConnect
export enum WalletApp {
  WalletConnect,
  Ledger,
  Keystore,
  Mnemonic,
}

@Injectable({
  providedIn: 'root',
})
export class BinanceService {
  static connector: Connector | null
  static walletConnector: WalletConnect
  constructor() {}

  async connect(app: WalletApp): Promise<Connector> {
    switch (app) {
      case WalletApp.WalletConnect:
        BinanceService.connector = await this.initWalletConnect()
        break
    }

    return BinanceService.connector
  }

  async initWalletConnect(): Promise<WalletConnect> {
    // Create a walletConnector
    const connector = new WalletConnect({
      bridge: 'https://bridge.walletconnect.org', // Required
    })
    return connector
  }

  disconnect() {
    console.log('Disconnect')
    BinanceService.connector = null
  }
}
