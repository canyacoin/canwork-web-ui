import { Injectable, EventEmitter } from '@angular/core'
import WalletConnect from '@trustwallet/walletconnect'
import { BehaviorSubject } from 'rxjs'
import base64js from 'base64-js'

import BncClient, { crypto } from '@binance-chain/javascript-sdk'
import { environment } from '@env/environment'
import { formatAtomicCan } from '@util/currency-conversion'
import { AuthService } from '@service/auth.service'
import { UserService } from '@service/user.service'
import { LedgerService } from '@service/ledger.service'
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
  connector?: Connector
  address?: string
  keystore?: object
  account?: object
  ledgerApp?: any
  ledgerHdPath?: number[]
  ledgerIndex?: number
}

export interface Event {
  type: EventType
  walletApp?: WalletApp
  details: EventDetails
  forced?: boolean
}

export interface Transaction {
  to: string
  amountCan: number
  memo: string
  callbacks?: TransactionCallbacks
}

export interface TransactionCallbacks {
  beforeTransaction?: () => void
  onSuccess?: () => void
  onFailure?: (reason?: string) => void
}

const ESCROW_ADDRESS = environment.binance.escrowAddress
const CHAIN_ID = environment.binance.chainId
const NETWORK_ID = 714
const DEFAULT_FEE = 37500
const CAN_TOKEN = environment.binance.canToken
const BASE_API_URL = environment.binance.api
const BINANCE_NETWORK = environment.binance.net
const TICKER_API_URL = `${BASE_API_URL}api/v1/ticker/24hr`
const FEE_API_URL = `${BASE_API_URL}api/v1/fees`

@Injectable({
  providedIn: 'root',
})
export class BinanceService {
  connector: Connector | null
  private events: BehaviorSubject<Event | null> = new BehaviorSubject(null)
  events$ = this.events.asObservable()
  transactionsEmitter: EventEmitter<Transaction> = new EventEmitter<
    Transaction
  >()
  client = new BncClient(BASE_API_URL)
  private connectedWalletApp: WalletApp = null
  private connectedWalletDetails: any = null
  private pendingConnectRequest: Event = null
  private sendingFee: number = 0

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private ledgerService: LedgerService
  ) {
    this.client.chooseNetwork(BINANCE_NETWORK)
    this.client.initChain()
    this.subscribeToEvents()
    const connectedWallet = JSON.parse(localStorage.getItem('connectedWallet'))
    if (connectedWallet) {
      if (connectedWallet.walletApp === WalletApp.Keystore) {
        const { keystore, address } = connectedWallet
        this.initKeystore(keystore, address)
      } else if (connectedWallet.walletApp === WalletApp.Ledger) {
        const { ledgerIndex } = connectedWallet
        this.initiateLedgerConnection(ledgerIndex)
      }
    }
  }

  private resetConnector() {
    this.connector = null
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
        if (
          walletApp === WalletApp.Keystore ||
          walletApp === WalletApp.Ledger
        ) {
          let connectedWallet: Object = {
            walletApp,
            address: details.address,
          }
          if (walletApp === WalletApp.Keystore) {
            connectedWallet = {
              ...connectedWallet,
              keystore: details.keystore,
            }
          } else if (walletApp === WalletApp.Ledger) {
            connectedWallet = {
              ...connectedWallet,
              ledgerIndex: details.ledgerIndex,
            }
          }
          localStorage.setItem(
            'connectedWallet',
            JSON.stringify(connectedWallet)
          )
        }
      } else if (
        type === EventType.Disconnect ||
        type === EventType.ConnectFailure
      ) {
        this.connectedWalletApp = null
        this.connectedWalletDetails = null
        localStorage.removeItem('connectedWallet')
      }
    })
  }

  getAddress(): string {
    if (!this.connectedWalletDetails) {
      return null
    }
    return this.connectedWalletDetails.address
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

  checkAddress(address: string): boolean {
    return this.client.checkAddress(address, environment.binance.prefix)
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

  initiateLedgerConnection(ledgerIndex = 0) {
    this.events.next({
      type: EventType.Init,
      details: { ledgerIndex },
    })
  }

  async connectLedger(
    ledgerIndex: number,
    beforeAttempting?: () => void,
    onSuccess?: () => void,
    onFailure?: () => void
  ) {
    const successCallback = (
      address: string,
      ledgerApp: any,
      ledgerHdPath: number[],
      ledgerIndex: number
    ) => {
      this.initLedger(address, ledgerApp, ledgerHdPath, ledgerIndex)
      if (onSuccess) {
        onSuccess()
      }
    }
    return this.ledgerService.connectLedger(
      ledgerIndex,
      beforeAttempting,
      successCallback,
      onFailure
    )
  }

  private initLedger(
    address: string,
    ledgerApp: any,
    ledgerHdPath: number[],
    ledgerIndex: number
  ) {
    this.events.next({
      type: EventType.ConnectRequest,
      walletApp: WalletApp.Ledger,
      details: {
        connector: null,
        address,
        ledgerApp,
        ledgerHdPath,
        ledgerIndex,
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

  private async initFeeIfNecessary() {
    console.log('init Fee')
    if (this.sendingFee === 0) {
      try {
        const response = await (await fetch(FEE_API_URL)).json()
        const feeParams = response
          .map(item => item.fixed_fee_params)
          .filter(params => params !== undefined)
          .find(params => params.msg_type === 'send')
        this.sendingFee = feeParams.fee
      } catch (e) {
        console.warn('Unable to get fee, using default')
        this.sendingFee = DEFAULT_FEE
      }
    }
  }

  // It returns result in atomic CAN units i.e. 1e-8
  async getUsdToAtomicCan(amountOfUsd: number = 1): Promise<number> {
    try {
      const canBnbUrl = `${TICKER_API_URL}?symbol=${CAN_TOKEN}_BNB`
      const canResponse = await (await fetch(canBnbUrl)).json()
      const lastCanToBnbPrice = canResponse[0].weightedAvgPrice
      const bnbUsdPair =
        CAN_TOKEN.indexOf('TCAN') >= 0 ? 'BNB_USDT.B-B7C' : 'BNB_BUSD-BD1'
      const bnbUsdUrl = `${TICKER_API_URL}?symbol=${bnbUsdPair}`
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

  // It returns result in atomic units i.e. 1e-8
  // TODO:  Combine/Refactor with getUsdtoAtomicCan
  async getAssetToUsd(assetSymbol: string): Promise<number> {
    try {
      let lastAssetToBnbPrice = 1 //1 for BNB
      if (assetSymbol != 'BNB') {
        const assetUrl = `${TICKER_API_URL}?symbol=${assetSymbol}_BNB`
        const assetResponse = await (await fetch(assetUrl)).json()
        lastAssetToBnbPrice = assetResponse[0].weightedAvgPrice
      }
      const bnbUsdPair =
        CAN_TOKEN.indexOf('TCAN') >= 0 ? 'BNB_USDT.B-B7C' : 'BNB_BUSD-BD1'
      const bnbUsdUrl = `${TICKER_API_URL}?symbol=${bnbUsdPair}`
      const bnbResponse = await (await fetch(bnbUsdUrl)).json()
      const lastBnbToUsdPrice = bnbResponse[0].weightedAvgPrice
      const assetToUsd = lastAssetToBnbPrice * lastBnbToUsdPrice

      return Promise.resolve(assetToUsd)
    } catch (error) {
      console.error(error)
      return Promise.reject(null)
    }
  }

  async hasEnoughBalance(amountCan: number) {
    try {
      const { address } = this.connectedWalletDetails
      const balance = await this.client.getBalance(address)
      const availableBnb = Number.parseFloat(
        balance.find(coin => coin.symbol === 'BNB').free
      )
      const availableCan = Number.parseFloat(
        balance.find(coin => coin.symbol === CAN_TOKEN).free
      )
      return (
        availableCan * 1e8 >= amountCan && availableBnb * 1e8 >= this.sendingFee
      )
    } catch (e) {
      // user doesn't have any CAN or BNB at all
      return false
    }
  }

  emitTransaction(transaction: Transaction) {
    console.log('emit tx')
    this.transactionsEmitter.emit(transaction)
  }

  private async preconditions(
    amountCan: number,
    onFailure?: (reason?: string) => void
  ): Promise<boolean> {
    console.log('preconditions')
    await this.initFeeIfNecessary()
    const hasBalance = await this.hasEnoughBalance(amountCan)
    if (!hasBalance) {
      onFailure("your wallet doesn't have enough CAN or BNB")
      return false
    }
    return true
  }

  async escrowFunds(
    jobId: string,
    amountCan: number,
    providerAddress: string,
    beforeTransaction?: () => void,
    onSuccess?: () => void,
    onFailure?: (reason?: string) => void
  ) {
    const preconditionsOk = await this.preconditions(amountCan, onFailure)
    if (!preconditionsOk) {
      return
    }
    const memo = `ESCROW:${jobId}:${providerAddress}`
    const to = ESCROW_ADDRESS
    const callbacks: TransactionCallbacks = {
      beforeTransaction,
      onSuccess,
      onFailure,
    }
    const transaction: Transaction = {
      to,
      amountCan,
      memo,
      callbacks,
    }
    this.emitTransaction(transaction)
  }

  async releaseFunds(
    jobId: string,
    beforeTransaction?: () => void,
    onSuccess?: () => void,
    onFailure?: (reason?: string) => void
  ) {
    console.log('release funds')
    const amountCan = 1
    const preconditionsOk = await this.preconditions(amountCan, onFailure)
    if (!preconditionsOk) {
      return
    }
    const memo = `RELEASE:${jobId}`
    const to = ESCROW_ADDRESS

    const callbacks: TransactionCallbacks = {
      beforeTransaction,
      onSuccess,
      onFailure,
    }
    const transaction: Transaction = {
      to,
      amountCan,
      memo,
      callbacks,
    }
    this.emitTransaction(transaction)
  }

  async transactViaLedger(
    to: string,
    amountCan: number,
    memo: string,
    beforeTransaction?: () => void,
    onSuccess?: () => void,
    onFailure?: (reason?: string) => void
  ) {
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
        CAN_TOKEN,
        memo
      )

      if (results.result[0].ok) {
        if (onSuccess) {
          onSuccess()
        }
      }
    } catch (err) {
      console.error(err)
      if (onFailure) {
        onFailure(err.message)
      }
    }
  }

  async transactViaKeystore(
    to: string,
    amountCan: number,
    memo: string,
    password: string,
    beforeTransaction?: () => void,
    onSuccess?: () => void,
    onFailure?: (reason?: string) => void
  ) {
    console.log('transact via KeyStore')
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
        CAN_TOKEN,
        memo
      )

      if (results.result[0].ok) {
        if (onSuccess) {
          onSuccess()
        }
      }
    } catch (err) {
      console.error(err)
      if (onFailure) {
        onFailure(err.message)
      }
    }
  }

  async transactViaWalletConnect(
    to: string,
    amountCan: number,
    memo: string,
    beforeTransaction?: () => void,
    onSuccess?: () => void,
    onFailure?: (reason?: string) => void
  ) {
    console.log('transact via WalletConnect')
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
            denom: CAN_TOKEN,
            amount: amountStr,
          },
        },
      ],
      outputs: [
        {
          address: base64js.fromByteArray(crypto.decodeAddress(to)),
          coins: {
            denom: CAN_TOKEN,
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
      const response = await this.client.sendRawTransaction(result, true)
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      // Error returned when rejected
      console.error(err)
      if (onFailure) {
        onFailure(err.message)
      }
    }
  }
}
