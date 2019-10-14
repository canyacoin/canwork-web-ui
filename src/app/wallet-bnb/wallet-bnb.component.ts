import { Component, OnInit, OnDestroy } from '@angular/core'
import { Router } from '@angular/router'
import { BinanceService, WalletApp, EventType } from '@service/binance.service'
import WalletConnect from '@trustwallet/walletconnect'
import WalletConnectQRCodeModal from '@walletconnect/qrcode-modal'
import { Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'
import { crypto, ledger } from '@binance-chain/javascript-sdk'
import u2f_transport from '@ledgerhq/hw-transport-u2f'
import { environment } from '@env/environment'

ledger.transports.u2f = u2f_transport
const win = window as any
win.ledger = ledger

@Component({
  selector: 'app-wallet-bnb',
  templateUrl: './wallet-bnb.component.html',
  styleUrls: ['./wallet-bnb.component.css'],
})
export class WalletBnbComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject()
  selected: WalletApp = WalletApp.WalletConnect
  WalletApp = WalletApp

  validKeystoreUploaded: boolean = false
  keystoreError: string = ''
  keystorePassword: string = ''
  keystore: object = null
  unlockingFailed: boolean = false
  ledgerIndex: number = 0
  ledgerConnecting: boolean = false

  constructor(private binanceService: BinanceService, private router: Router) {}

  ngOnInit() {
    this.binanceService.events$
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        console.log('Event', event)
        if (!event) {
          return
        }

        switch (event.type) {
          case EventType.Init:
            const { connector } = event.details
            if (connector instanceof WalletConnect) {
              this.walletConnect(connector)
            }
            break
          case EventType.Connect:
            this.router.navigate(['/wallet-bnb/assets'])
        }
      })
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }

  isActive(wallet: WalletApp): boolean {
    return this.selected == wallet
  }

  async connect(app: WalletApp) {
    await this.binanceService.connect(app)
  }

  async walletConnect(connector: WalletConnect) {
    // Subscribe to connection events
    connector.on('connect', () => {
      // Close QR Code Modal
      WalletConnectQRCodeModal.close()
      // Get provided accounts and chainId
    })

    if (connector.connected) {
      await connector.killSession()
    }
    // Reconnect
    await connector.createSession()
    // get uri for QR Code modal
    const uri = connector.uri
    // display QR Code modal
    WalletConnectQRCodeModal.open(uri, () => {
      console.log('QR Code Modal closed')
    })

    // hack
    setTimeout(() => {
      const qrModal = document.getElementById('walletconnect-qrcode-modal')
      if (qrModal) {
        qrModal.style.zIndex = '99999'
      }
    }, 100)
  }

  showKeystoreError(error: string) {
    this.validKeystoreUploaded = false
    this.keystoreError = error
  }

  uploadFile(event) {
    const file = event.target.files.item(0)
    let fileReader = new FileReader()

    fileReader.onload = () => {
      try {
        const json = JSON.parse(<string>(<any>fileReader.result))
        if (!('version' in json) || !('crypto' in json)) {
          throw Error()
        } else {
          this.validKeystoreUploaded = true
          this.keystoreError = null
          this.keystore = json
        }
      } catch (e) {
        console.error(e)
        this.showKeystoreError('Not a valid keystore file')
      }
    }

    fileReader.onerror = () => this.showKeystoreError('Upload failed')
    fileReader.onabort = () => this.showKeystoreError('Upload aborted')

    fileReader.readAsText(file)
  }

  resetUnlocking() {
    this.unlockingFailed = false
  }

  unlockKeystore() {
    const keystore = this.keystore
    const password = this.keystorePassword

    try {
      const privateKey = crypto.getPrivateKeyFromKeyStore(keystore, password)
      const address = crypto.getAddressFromPrivateKey(
        privateKey,
        environment.binance.prefix
      )

      this.keystore = null
      this.keystorePassword = ''
      this.keystoreError = ''
      this.validKeystoreUploaded = false

      this.binanceService.initKeystore(keystore, address)
    } catch (e) {
      this.unlockingFailed = true
    }
  }

  async connectLedger() {
    this.ledgerConnecting = true

    // use the u2f transport
    const timeout = 50000
    const transport = await ledger.transports.u2f.create(timeout)
    const win = window as any
    win.app = new ledger.app(transport, 100000, 100000)
    const app = win.app

    // get version
    try {
      const version = await app.getVersion()
      console.log('version', version)
    } catch ({ message, statusCode }) {
      console.error('version error', message, statusCode)
    }

    // we can provide the hd path (app checks first two parts are same as below)
    const hdPath = [44, 714, 0, 0, this.ledgerIndex]

    // select which address to use
    const results = await app.showAddress(environment.binance.prefix, hdPath)
    console.log('Results:', results)

    // get public key
    let pk
    try {
      pk = (await app.getPublicKey(hdPath)).pk

      // get address from pubkey
      const address = crypto.getAddressFromPublicKey(
        pk,
        environment.binance.prefix
      )
      console.log('address', address)

      this.binanceService.initLedger(address, app, hdPath)
      this.ledgerConnecting = false
    } catch (err) {
      console.error('pk error', err.message, err.statusCode)
      this.ledgerConnecting = false
      return
    }
  }
}
