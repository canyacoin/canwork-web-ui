import { Injectable } from '@angular/core'
import WalletConnect from '@trustwallet/walletconnect'
import { BehaviorSubject } from 'rxjs'

export type Connector = WalletConnect
export enum WalletApp {
  WalletConnect,
  Ledger,
  Keystore,
  Mnemonic,
}

export enum EventType {
  Init = 'Init',
  Connect = 'Connect',
  Update = 'Update',
  Disconnect = 'Disconnect',
}

export interface EventDetails {
  connector: Connector
  address?: string
  keystore?: string
}

export interface Event {
  type: EventType
  details: EventDetails
}

@Injectable({
  providedIn: 'root',
})
export class BinanceService {
  connector: Connector | null
  private events: BehaviorSubject<Event | null> = new BehaviorSubject(null)
  $events = this.events.asObservable()

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

    this.events.next({
      type: EventType.Init,
      details: { connector },
    })

    connector.on('connect', async error => {
      if (error) {
        this.events.error(error)
        return
      }

      this.events.next({
        type: EventType.Connect,
        details: { connector, address: await this.getAddress() },
      })
    })

    connector.on('session_update', async error => {
      if (error) {
        this.events.error(error)
        return
      }

      this.events.next({
        type: EventType.Update,
        details: { connector, address: await this.getAddress() },
      })
    })

    connector.on('disconnect', error => {
      if (error) {
        this.events.error(error)
        return
      }

      this.events.next({
        type: EventType.Disconnect,
        details: { connector },
      })
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
