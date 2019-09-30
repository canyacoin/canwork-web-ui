import { Injectable } from '@angular/core'
import { Account } from '@trustwallet/types'
import WalletConnect from '@trustwallet/walletconnect'
import WalletConnectQRCodeModal from '@walletconnect/qrcode-modal'

@Injectable({
  providedIn: 'root',
})
export class BinanceService {
  static walletConnector: WalletConnect
  constructor() {}

  connectWalletConnect(): Promise<Account> {
    return new Promise(async (resolve, reject) => {
      // Create a walletConnector
      const walletConnector = new WalletConnect({
        bridge: 'https://bridge.walletconnect.org', // Required
      })
      BinanceService.walletConnector = walletConnector

      // Subscribe to connection events
      walletConnector.on('connect', async error => {
        if (error) {
          reject(error)
        }
        // Close QR Code Modal
        WalletConnectQRCodeModal.close()
        // Get provided accounts and chainId
        const accounts = await walletConnector.getAccounts()
        console.log(accounts)
        resolve(accounts.find(account => account.network == 714))
      })

      walletConnector.on('disconnect', error => {
        if (error) {
          reject(error)
        }
        // Delete walletConnector
        this.disconnect()
      })

      // Check if connection is already established
      if (!walletConnector.connected) {
        // create new session
        await walletConnector.createSession()
        // get uri for QR Code modal
        const uri = walletConnector.uri
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

  disconnect() {
    console.log('Disconnect')
    BinanceService.walletConnector = undefined
  }
}
