import { Component, OnInit, OnDestroy } from '@angular/core'
import { BinanceService, WalletApp } from '@service/binance.service'
import WalletConnect from '@trustwallet/walletconnect'
import { Account } from '@trustwallet/types'
import WalletConnectQRCodeModal from '@walletconnect/qrcode-modal'

@Component({
  selector: 'app-wallet-bnb',
  templateUrl: './wallet-bnb.component.html',
  styleUrls: ['./wallet-bnb.component.css'],
})
export class WalletBnbComponent implements OnInit, OnDestroy {
  selected: WalletApp = WalletApp.WalletConnect
  WalletApp = WalletApp

  constructor(private binanceService: BinanceService) {}

  ngOnInit() {}

  ngOnDestroy() {
    this.binanceService.disconnect()
  }

  isActive(wallet: WalletApp): boolean {
    return this.selected == wallet
  }

  async connect(app: WalletApp) {
    const connector = await this.binanceService.connect(app)
    let account: Account
    if (connector instanceof WalletConnect) {
      account = await this.walletConnect(connector)
    }
  }

  walletConnect(connector: WalletConnect): Promise<Account> {
    return new Promise(async (resolve, reject) => {
      // Subscribe to connection events
      connector.on('connect', async error => {
        if (error) {
          reject(error)
        }
        // Close QR Code Modal
        WalletConnectQRCodeModal.close()
        // Get provided accounts and chainId
        const accounts = await connector.getAccounts()
        console.log(accounts)
        resolve(accounts.find(account => account.network == 714))
      })

      connector.on('disconnect', error => {
        if (error) {
          reject(error)
        }
        // Delete walletConnector
        // this.disconnect()
      })

      // Check if connection is already established
      if (!connector.connected) {
        // create new session
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
    })
  }
}
