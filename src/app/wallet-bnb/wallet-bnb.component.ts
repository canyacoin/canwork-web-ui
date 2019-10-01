import { Component, OnInit, OnDestroy } from '@angular/core'
import { BinanceService, WalletApp, EventType } from '@service/binance.service'
import WalletConnect from '@trustwallet/walletconnect'
import WalletConnectQRCodeModal from '@walletconnect/qrcode-modal'
import { Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'

@Component({
  selector: 'app-wallet-bnb',
  templateUrl: './wallet-bnb.component.html',
  styleUrls: ['./wallet-bnb.component.css'],
})
export class WalletBnbComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject()
  selected: WalletApp = WalletApp.WalletConnect
  WalletApp = WalletApp

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
}
