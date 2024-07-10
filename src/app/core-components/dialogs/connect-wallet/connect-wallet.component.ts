import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core'
import { BscService, EventTypeBsc } from '@service/bsc.service'
import { Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'
import { crypto } from '@binance-chain/javascript-sdk'
import { environment } from '@env/environment'
import { AuthService } from '@service/auth.service'
import { WalletApp } from '@service/bsc.service'
import { MessageService } from 'primeng/api'

@Component({
  selector: 'connect-wallet-dialog',
  templateUrl: './connect-wallet.component.html',
})
export class ConnectWalletDialogComponent implements OnInit, OnDestroy {
  // two way data binding
  private _visible: boolean
  @Input()
  get visible(): boolean {
    return this._visible
  }
  set visible(value: boolean) {
    this._visible = value
    this.visibleChange.emit(this._visible)
  }
  @Output() visibleChange = new EventEmitter<boolean>()
  @Output() modalClosed = new EventEmitter()

  closeModal(event?: Event): void {
    event?.preventDefault()
    document.body.style.overflow = 'auto'
    this.visible = false
    this.modalClosed.emit()
  }

  private destroy$ = new Subject()
  selected: WalletApp = WalletApp.MetaMask
  WalletApp = WalletApp

  validKeystoreUploaded: boolean = false
  keystoreError: string = ''
  bscError: string = ''
  keystorePassword: string = ''
  keystore: object = null
  unlockingFailed: boolean = false
  ledgerIndex: number = 0
  attemptedConnection = false
  walletReplacement = {
    old: null,
    new: null,
  }
  walletReplacementBsc = {
    old: null,
    new: null,
  }
  returnUrl: string
  isAnotherBscChain = false
  isWalletConnecting = false

  constructor(
    private bscService: BscService,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    if (this.visible) document.body.style.overflow = 'hidden'
    // we are not on production env but wallect connect bsc will use main net, better to warn user

    if (this.visible) {
      this.bscService.events$
        .pipe(takeUntil(this.destroy$))
        .subscribe(async (event) => {
          if (!event) {
            return
          }
          switch (event.type) {
            case EventTypeBsc.ConnectSuccess:
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: `Wallet Connected successfully.`,
              })
              this.closeModal()
              break
            case EventTypeBsc.AddressFound:
              if (!(await this.bscService.isBscConnected())) {
                // address found but not connected, probably address is changed, force reconnect
              } else {
                this.closeModal()
              }
              break
            case EventTypeBsc.ConnectFailure:
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: `This address is already in use by another user`,
              })
              break
            case EventTypeBsc.ConnectConfirmationRequired:
              console.log('wallet-bnb EventTypeBsc.ConnectConfirmationRequired')
              const user = await this.authService.getCurrentUser()
              this.walletReplacementBsc = {
                old: user.bscAddress,
                new: event.details.address,
              }
              // ;(window as any).$('#replaceWalletModalBsc').modal('show')
              break
          }
        })
    }
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }

  isActive(wallet: WalletApp): boolean {
    return this.selected == wallet
  }

  async connect(app: WalletApp) {
    // bsc connect methods
    if (app == WalletApp.MetaMask || app == WalletApp.WalletConnectBsc) {
      this.closeModal()
      this.isWalletConnecting = true
      this.bscError = ''

      // WalletApp.WalletConnectBsc (i.e. Trust, qr from desktop or direct from mobile intent or trust dapp browser)
      this.bscError = await this.bscService.connect(app)
      this.isWalletConnecting = false
    }
  }

  /*
  obsolete, unused
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

    this.attemptedConnection = true

    // hack
    setTimeout(() => {
      const qrModal = document.getElementById('walletconnect-qrcode-modal')
      if (qrModal) {
        qrModal.style.zIndex = '99999'
      }
    }, 100)
  }
  */

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

      this.attemptedConnection = true
      // this.binanceService.initKeystore(keystore, address)
    } catch (e) {
      this.unlockingFailed = true
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: `Incorrect Password`,
      })
    }
  }

  connectLedger() {
    this.attemptedConnection = true
    // this.binanceService.initiateLedgerConnection(this.ledgerIndex)
  }

  onConfirmWalletUpdate() {
    // this.binanceService.confirmConnection()
  }

  async onConfirmWalletUpdateBsc() {
    this.bscError = ''
    await this.bscService.confirmConnection(
      this.walletReplacementBsc.new,
      this.WalletApp
    )
  }

  isTestnet() {
    return environment.binance.net === 'testnet'
  }
}
