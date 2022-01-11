import { Component, OnInit, OnDestroy } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { BinanceService, WalletApp, EventType } from '@service/binance.service'
import { BscService, WalletAppBsc, EventTypeBsc } from '@service/bsc.service'
import WalletConnect from './../core-classes/walletConnect'
import WalletConnectQRCodeModal from '@walletconnect/qrcode-modal'
import { Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'
import { crypto } from '@binance-chain/javascript-sdk'
import { environment } from '@env/environment'
import { ToastrService } from 'ngx-toastr'
import { AuthService } from '@service/auth.service'

@Component({
  selector: 'app-wallet-bnb',
  templateUrl: './wallet-bnb.component.html',
  styleUrls: ['./wallet-bnb.component.css'],
})
export class WalletBnbComponent implements OnInit, OnDestroy {
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
  walletconnectConnecting = false

  constructor(
    private binanceService: BinanceService,
    private bscService: BscService,
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    
    if (environment.bsc.netId != environment.bsc.mainNetId) this.isAnotherBscChain = true 
    // we are not on production env but wallect connect bsc will use main net, better to warn user
    
    
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/wallet-bnb/assets'
    
    this.bscService.events$
      .pipe(takeUntil(this.destroy$))
      .subscribe(async event => {
        if (!event) {
          return
        }
        switch (event.type) {
          case EventTypeBsc.ConnectSuccess:
            this.toastr.success('Connected!')
            this.router.navigate([this.returnUrl])
            break
          case EventTypeBsc.AddressFound:
            this.router.navigate([this.returnUrl])
            break
          case EventTypeBsc.ConnectFailure:
            this.toastr.error('This address is already in use by another user')
            break
          case EventTypeBsc.ConnectConfirmationRequired:
            const user = await this.authService.getCurrentUser()
            this.walletReplacementBsc = {
              old: user.bscAddress,
              new: event.details.address,
            }
            ;(window as any).$('#replaceWalletModalBsc').modal('show')
            break            
        }
      })          


    this.binanceService.events$
      .pipe(takeUntil(this.destroy$))
      .subscribe(async event => {
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
          case EventType.ConnectSuccess:
            this.toastr.success('Unlocking Successful')
            this.router.navigate([this.returnUrl])
            break
          case EventType.ConnectFailure:
            if (this.attemptedConnection) {
              this.toastr.error(
                'This address is already in use by another user'
              )
            }
            break
          case EventType.ConnectConfirmationRequired:
            const user = await this.authService.getCurrentUser()
            this.walletReplacement = {
              old: user.bnbAddress,
              new: event.details.address,
            }
            ;(window as any).$('#replaceWalletModal').modal('show')
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

    // bsc connect methods
    if (app == WalletApp.MetaMask || app == WalletApp.WalletConnectBsc) {
      this.walletconnectConnecting = true
      this.bscError = ''
      
      // WalletApp.WalletConnectBsc (i.e. Trust, qr from desktop or direct from mobile intent or trust dapp browser)
      this.bscError = await this.bscService.connect(app)   
      this.walletconnectConnecting = false

      if (this.bscError) {
        await new Promise(f => setTimeout(f, 2000));  // sleep 2000 ms 
        this.bscError = '' // clean up
      
      }
      
    } else {
    
      // binance connect methods
      await this.binanceService.connect(app)
    
    }
    
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

    this.attemptedConnection = true

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

      this.attemptedConnection = true
      this.binanceService.initKeystore(keystore, address)
    } catch (e) {
      this.unlockingFailed = true
      this.toastr.error('Incorrect Password')
    }
  }

  connectLedger() {
    this.attemptedConnection = true
    this.binanceService.initiateLedgerConnection(this.ledgerIndex)
  }

  onConfirmWalletUpdate() {
    this.binanceService.confirmConnection()
  }
  
  async onConfirmWalletUpdateBsc() {
    this.bscError = ''    
    await this.bscService.confirmConnection(this.walletReplacementBsc.new, this.WalletApp)
  }  

  isTestnet() {
    return environment.binance.net === 'testnet'
  }
}
