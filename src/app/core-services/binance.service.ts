import { Injectable } from '@angular/core'
import WalletConnect from '@trustwallet/walletconnect'
import { BehaviorSubject } from 'rxjs'
import base64js from 'base64-js'

import BncClient, { crypto } from '@binance-chain/javascript-sdk'
import { environment } from '@env/environment'
import { formatAtomicCan } from '@util/currency-conversion'
import { AuthService } from '@service/auth.service'
import { UserService } from '@service/user.service'
import { BinanceValidator } from '@validator/binance.validator'

export type Connector = WalletConnect
export enum WalletApp {
  WalletConnect,
  Ledger,
  Keystore,
  Mnemonic,
}

export enum EventType {
  Init = 'Init',
  ConnectRequest = 'ConnectRequest',
  ConnectSuccess = 'ConnectSuccess',
  ConnectFailure = 'ConnectFailure',
  ConnectConfirmationRequired = 'ConnectConfirmationRequired',
  Update = 'Update',
  Disconnect = 'Disconnect',
}

export interface EventDetails {
  connector: Connector
  address?: string
  keystore?: object
  account?: object
  ledgerApp?: any
  ledgerHdPath?: number[]
}

export interface Event {
  type: EventType
  walletApp?: WalletApp
  details: EventDetails
  forced?: boolean
}

const ESCROW_ADDRESS = environment.binance.escrowAddress
const CHAIN_ID = environment.binance.chainId
const NETWORK_ID = 714

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
  private pendingConnectRequest: Event = null

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {
    this.client.chooseNetwork(environment.binance.net)
    this.client.initChain()
    this.subscribeToEvents()
  }

  private resetConnector() {
    this.connector = null
    console.log('Reset connector')
  }

  private subscribeToEvents() {
    this.events$.subscribe(async event => {
      if (!event) {
        return
      }
      const { type, walletApp, details, forced } = event
      if (type === EventType.ConnectRequest && walletApp !== undefined) {
        // attemp to save wallet address to DB
        const { address } = details
        const user = await this.authService.getCurrentUser()
        if (user && user.bnbAddress !== address) {
          const validator = new BinanceValidator(this, this.userService)
          // already has a different address
          if (user.bnbAddress && !forced) {
            this.pendingConnectRequest = event
            this.events.next({
              type: EventType.ConnectConfirmationRequired,
              walletApp,
              details,
            })
            return
          }
          // address already used by another user
          if (await validator.isUniqueAddress(address, user)) {
            this.userService.updateUserProperty(user, 'bnbAddress', address)
            console.log('updated bnbAddress')
          } else {
            this.events.next({
              type: EventType.ConnectFailure,
              walletApp,
              details,
            })
            return
          }
        }
        this.events.next({
          type: EventType.ConnectSuccess,
          walletApp,
          details,
        })
      } else if (type === EventType.ConnectSuccess) {
        this.connectedWalletApp = walletApp
        this.connectedWalletDetails = details
      } else if (
        type === EventType.Disconnect ||
        type === EventType.ConnectFailure
      ) {
        this.connectedWalletApp = null
        this.connectedWalletDetails = null
      }
    })
  }

  confirmConnection() {
    this.events.next({
      ...this.pendingConnectRequest,
      forced: true,
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

      const account = await this.getAccountWalletConnect()
      const { address } = account
      this.events.next({
        type: EventType.ConnectRequest,
        walletApp: WalletApp.WalletConnect,
        details: { connector, account, address },
      })
    })

    connector.on('session_update', async error => {
      if (error) {
        this.events.error(error)
        return
      }

      const account = await this.getAccountWalletConnect()
      const { address } = account
      this.events.next({
        type: EventType.Update,
        details: { connector, account, address },
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

  async getAccountWalletConnect() {
    const connector = this.connector
    if (connector instanceof WalletConnect) {
      const wcAccounts = await connector.getAccounts()
      const wcAccount = wcAccounts.find(
        account => account.network == NETWORK_ID
      )
      const response = await this.client.getAccount(wcAccount.address)
      if (response.status === 200) {
        return response.result
      }
    }
    return null
  }

  initKeystore(keystore: object, address: string) {
    this.events.next({
      type: EventType.ConnectRequest,
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
      type: EventType.ConnectRequest,
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

  isKeystoreConnected(): boolean {
    return this.connectedWalletApp === WalletApp.Keystore
  }

  isWalletConnectConnected(): boolean {
    return this.connectedWalletApp === WalletApp.WalletConnect
  }

  // It returns result in atomic CAN units i.e. 1e-8
  async getUsdToAtomicCan(amountOfUsd: number = 1): Promise<number> {
    try {
      const { api, canToken } = environment.binance
      const canBnbUrl = `${api}api/v1/ticker/24hr?symbol=${canToken}_BNB`
      const canResponse = await (await fetch(canBnbUrl)).json()
      const lastCanToBnbPrice = canResponse[0].weightedAvgPrice
      const bnbUsdUrl = `${api}api/v1/ticker/24hr?symbol=BNB_USDT.B-B7C`
      const bnbResponse = await (await fetch(bnbUsdUrl)).json()
      const lastBnbToUsdPrice = bnbResponse[0].weightedAvgPrice
      const usdToCanPrice = 1 / (lastCanToBnbPrice * lastBnbToUsdPrice)
      const resultPrice = Math.ceil(usdToCanPrice * amountOfUsd * 1e8)
      return Promise.resolve(resultPrice)
    } catch (error) {
      console.error(error)
      return Promise.reject(null)
    }
  }

  async hasEnoughBalance(
    amountCan: number,
  ) {
    try {
      const { address } = this.connectedWalletDetails
      const balance = await this.client.getBalance(address)
      const availableBnb = Number.parseFloat(balance.find(coin => coin.symbol === 'BNB').free)
      const can = environment.binance.canToken
      const availableCan = Number.parseFloat(balance.find(coin => coin.symbol === can).free)
      return (availableCan * 1e8 >= amountCan && availableBnb >= 0.000375)
    } catch (e) {
      // user doesn't have any CAN or BNB at all
      return false
    }
  }

  async escrowFunds(
    jobId: string,
    amountCan: number,
    providerAddress: string,
    beforeTransaction?: () => void,
    onSuccess?: () => void,
    onFailure?: () => void,
    password?: string
  ) {
    await this.hasEnoughBalance(amountCan)
    const memo = `ESCROW:${jobId}:${providerAddress}`
    const to = ESCROW_ADDRESS
    if (this.isLedgerConnected()) {
      this.transactViaLedger(
        to,
        amountCan,
        memo,
        beforeTransaction,
        onSuccess,
        onFailure
      )
    } else if (this.isKeystoreConnected()) {
      this.transactViaKeystore(
        to,
        amountCan,
        memo,
        password,
        beforeTransaction,
        onSuccess,
        onFailure
      )
    } else if (this.isWalletConnectConnected()) {
      this.transactViaWalletConnect(
        to,
        amountCan,
        memo,
        beforeTransaction,
        onSuccess,
        onFailure
      )
    } else {
      console.error('Unsupported wallet type')
    }
  }

  async releaseFunds(
    jobId: string,
    beforeTransaction?: () => void,
    onSuccess?: () => void,
    onFailure?: () => void,
    password?: string
  ) {
    const memo = `RELEASE:${jobId}`
    const to = ESCROW_ADDRESS
    const amountCan = 1

    if (this.isLedgerConnected()) {
      this.transactViaLedger(
        to,
        amountCan,
        memo,
        beforeTransaction,
        onSuccess,
        onFailure
      )
    } else if (this.isKeystoreConnected()) {
      this.transactViaKeystore(
        to,
        amountCan,
        memo,
        password,
        beforeTransaction,
        onSuccess,
        onFailure
      )
    } else if (this.isWalletConnectConnected()) {
      this.transactViaWalletConnect(
        to,
        amountCan,
        memo,
        beforeTransaction,
        onSuccess,
        onFailure
      )
    } else {
      console.error('Unsupported wallet type')
    }
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

    try {
      this.client.useLedgerSigningDelegate(
        this.connectedWalletDetails.ledgerApp,
        null,
        null,
        null,
        this.connectedWalletDetails.ledgerHdPath
      )

      const { address } = this.connectedWalletDetails
      if (beforeTransaction) {
        beforeTransaction()
      }

      const adjustedAmount = formatAtomicCan(amountCan)
      const results = await this.client.transfer(
        address,
        to,
        adjustedAmount,
        environment.binance.canToken,
        memo
      )

      console.log(results)
      if (results.result[0].ok) {
        console.log(`Sent transaction: ${results.result.hash}`)
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

  private async transactViaKeystore(
    to: string,
    amountCan: number,
    memo: string,
    password: string,
    beforeTransaction?: () => void,
    onSuccess?: () => void,
    onFailure?: () => void
  ) {
    if (!this.isKeystoreConnected()) {
      console.error('Keystore is not connected')
      if (onFailure) {
        onFailure()
      }
      return
    }

    try {
      const privateKey = crypto.getPrivateKeyFromKeyStore(
        this.connectedWalletDetails.keystore,
        password
      )
      this.client.setPrivateKey(privateKey)
      const { address } = this.connectedWalletDetails
      if (beforeTransaction) {
        beforeTransaction()
      }

      const adjustedAmount = formatAtomicCan(amountCan)

      const results = await this.client.transfer(
        address,
        to,
        adjustedAmount,
        environment.binance.canToken,
        memo
      )

      console.log(results)
      if (results.result[0].ok) {
        console.log(`Sent transaction: ${results.result.hash}`)
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

  private async transactViaWalletConnect(
    to: string,
    amountCan: number,
    memo: string,
    beforeTransaction?: () => void,
    onSuccess?: () => void,
    onFailure?: () => void
  ) {
    if (!this.isWalletConnectConnected()) {
      console.error('WalletConnect is not connected')
      if (onFailure) {
        onFailure()
      }
      return
    }
    const { account } = this.connectedWalletDetails
    const { address } = account
    const tx = {
      accountNumber: account.account_number.toString(),
      chainId: CHAIN_ID,
      sequence: account.sequence.toString(),
      memo,
      send_order: {},
    }

    const amountStr = amountCan.toString()
    tx.send_order = {
      inputs: [
        {
          address: base64js.fromByteArray(crypto.decodeAddress(address)),
          coins: {
            denom: environment.binance.canToken,
            amount: amountStr,
          },
        },
      ],
      outputs: [
        {
          address: base64js.fromByteArray(crypto.decodeAddress(to)),
          coins: {
            denom: environment.binance.canToken,
            amount: amountStr,
          },
        },
      ],
    }

    if (beforeTransaction) {
      beforeTransaction()
    }

    try {
      const result = await this.connectedWalletDetails.connector.trustSignTransaction(
        NETWORK_ID,
        tx
      )
      // Returns transaction signed in json or encoded format
      console.log('Successfully signed msg:', result)
      const response = await this.client.sendRawTransaction(result, true)
      console.log('Response', response)
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      // Error returned when rejected
      console.error(error)
      if (onFailure) {
        onFailure()
      }
    }
  }
}
