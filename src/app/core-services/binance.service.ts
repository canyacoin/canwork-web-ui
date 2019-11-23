import { Injectable } from '@angular/core'
import WalletConnect from '@trustwallet/walletconnect'
import { BehaviorSubject } from 'rxjs'

import BncClient from '@binance-chain/javascript-sdk'
import { environment } from '@env/environment'

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
  keystore?: object
  ledgerApp?: any
  ledgerHdPath?: number[]
}

export interface Event {
  type: EventType
  walletApp?: WalletApp
  details: EventDetails
}

const ESCROW_TESTNET_ADDRESS = 'tbnb1cwwgw8hxzq26hhss8vgmhsf7ksuz2jcu2nmm0w'

@Injectable({
  providedIn: 'root',
})
export class BinanceService {
  connector: Connector | null
  private events: BehaviorSubject<Event | null> = new BehaviorSubject(null)
  events$ = this.events.asObservable()
  client = new BncClient(environment.binance.api)
  private connectedWalletApp: WalletApp = null
  private connectedWalletDetails: any = null

  constructor() {
    this.client.chooseNetwork(environment.binance.net)
    this.client.initChain()
    this.subscribeToEvents()
  }

  private resetConnector() {
    this.connector = null
    console.log('Reset connector')
  }

  private subscribeToEvents() {
    this.events$.subscribe(event => {
      if (!event) {
        return
      }
      const { type, walletApp, details } = event
      if (type === EventType.Connect && !!walletApp) {
        this.connectedWalletApp = walletApp
        this.connectedWalletDetails = details
      } else if (type === EventType.Disconnect) {
        this.connectedWalletApp = null
        this.connectedWalletDetails = null
      }
    })
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
        walletApp: WalletApp.WalletConnect,
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
    } else {
      this.events.next({
        type: EventType.Disconnect,
        details: {
          connector: null,
        },
      })
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

  initKeystore(keystore: object, address: string) {
    this.events.next({
      type: EventType.Connect,
      walletApp: WalletApp.Keystore,
      details: {
        connector: null,
        keystore,
        address,
      },
    })
  }

  initLedger(address: string, ledgerApp: any, ledgerHdPath: number[]) {
    this.events.next({
      type: EventType.Connect,
      walletApp: WalletApp.Ledger,
      details: {
        connector: null,
        address,
        ledgerApp,
        ledgerHdPath,
      },
    })
  }

  isLedgerConnected(): boolean {
    return this.connectedWalletApp === WalletApp.Ledger
  }

  async getUsdToCan(amountOfUsd: number = 1): Promise<number> {
    try {
      const canResponse = await (await fetch(
        'https://dex.binance.org/api/v1/ticker/24hr?symbol=CAN-677_BNB'
      )).json()
      const lastCanToBnbPrice = canResponse[0].lastPrice
      const bnbResponse = await (await fetch(
        'https://dex.binance.org/api/v1/ticker/24hr?symbol=BNB_BUSD-BD1'
      )).json()
      const lastBnbToUsdPrice = bnbResponse[0].lastPrice
      const usdToCanPrice = Math.round(
        1 / (lastCanToBnbPrice * lastBnbToUsdPrice)
      )
      return Promise.resolve(usdToCanPrice)
    } catch (error) {
      console.error(error)
      return Promise.reject(null)
    }
  }

  async escrowViaLedger(
    jobId: string,
    jobPriceUsd: number,
    amountCan: number,
    providerAddress: string,
    beforeTransaction?: () => void,
    onSuccess?: () => void,
    onFailure?: () => void
  ) {
    const memo = `ESCROW:${jobId}:${jobPriceUsd}:${providerAddress}`
    const to = ESCROW_TESTNET_ADDRESS
    this.transactViaLedger(
      to,
      amountCan,
      memo,
      beforeTransaction,
      onSuccess,
      onFailure
    )
  }

  async releaseViaLedger(
    jobId: string,
    beforeTransaction?: () => void,
    onSuccess?: () => void,
    onFailure?: () => void
  ) {
    const memo = `RELEASE:${jobId}`
    const to = ESCROW_TESTNET_ADDRESS
    const amountCan = 0.00000001
    this.transactViaLedger(
      to,
      amountCan,
      memo,
      beforeTransaction,
      onSuccess,
      onFailure
    )
  }

  private async transactViaLedger(
    to: string,
    amountCan: number,
    memo: string,
    beforeTransaction?: () => void,
    onSuccess?: () => void,
    onFailure?: () => void
  ) {
    if (!this.isLedgerConnected()) {
      console.error('Ledger is not connected')
      if (onFailure) {
        onFailure()
      }
      return
    }
    this.client.useLedgerSigningDelegate(
      this.connectedWalletDetails.ledgerApp,
      null,
      null,
      null,
      this.connectedWalletDetails.ledgerHdPath
    )

    try {
      const { address } = this.connectedWalletDetails
      const outputs = [
        {
          to,
          coins: [
            {
              denom: 'TCAN-014',
              amount: amountCan,
            },
          ],
        },
      ]
      if (beforeTransaction) {
        beforeTransaction()
      }

      const results = await this.client.multiSend(address, outputs, memo)

      console.log(results)
      if (results.result[0].ok) {
        console.log(`Sent transaction: ${results.result[0].hash}`)
        if (onSuccess) {
          onSuccess()
        }
      }
    } catch (err) {
      console.error(err)
      if (onFailure) {
        onFailure()
      }
    }
  }
}
