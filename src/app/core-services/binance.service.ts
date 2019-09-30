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
  connector: Connector | null
  constructor() {}

  private resetConnector() {
    this.connector = null
    console.log('Reset connector')
  }

  async connect(app: WalletApp): Promise<Connector> {
    switch (app) {
      case WalletApp.WalletConnect:
        this.connector = await this.initWalletConnect()
        break
    }

    return this.connector
  }

  private async initWalletConnect(): Promise<WalletConnect> {
    // Create a walletConnector
    const connector = new WalletConnect({
      bridge: 'https://bridge.walletconnect.org', // Required
    })

    connector.on('disconnect', () => {
      this.resetConnector()
      console.log('Disconnect event')
    })
    return connector
  }

  async disconnect() {
    const connector = this.connector
    if (connector instanceof WalletConnect) {
      if (connector.connected) {
        await connector.killSession()
      }
    }
    this.resetConnector()
    console.log('Disconnect')
  }

  async getAddress() {
    const connector = this.connector
    if (connector instanceof WalletConnect) {
      const accounts = await connector.getAccounts()
      return accounts.find(account => account.network == 714).address
    }
  }
}
