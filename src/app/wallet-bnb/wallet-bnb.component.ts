import { Component, OnInit, OnDestroy } from '@angular/core'
import { BinanceService, WalletApp, EventType } from '@service/binance.service'
import WalletConnect from '@trustwallet/walletconnect'
import WalletConnectQRCodeModal from '@walletconnect/qrcode-modal'
import { Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'
import { crypto } from '@binance-chain/javascript-sdk'

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

  constructor(private binanceService: BinanceService) {}

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
      const address = crypto.getAddressFromPrivateKey(privateKey, 'bnb')

      this.keystore = null
      this.keystorePassword = ''
      this.keystoreError = ''
      this.validKeystoreUploaded = false

      this.binanceService.initKeystore(keystore, address)
    } catch (e) {
      this.unlockingFailed = true
    }
  }
}
