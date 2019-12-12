import { Injectable } from '@angular/core'
import { crypto, ledger } from '@binance-chain/javascript-sdk'
import u2f_transport from '@ledgerhq/hw-transport-u2f'

import { environment } from '@env/environment'

ledger.transports.u2f = u2f_transport
const win = window as any
win.ledger = ledger

@Injectable({
  providedIn: 'root',
})
export class LedgerService {
  async connectLedger(
    ledgerIndex: number,
    beforeAttempting?: () => void,
    onSuccess?: (address: string, ledgerApp: any, ledgerHdPath: number[]) => void,
    onFailure?: (reason?: string) => void
  ) {
    if (beforeAttempting) {
      beforeAttempting()
    }

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
    const hdPath = [44, 714, 0, 0, ledgerIndex]

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

      if (onSuccess) {
        onSuccess(address, app, hdPath)
      }
    } catch (err) {
      console.error('pk error', err.message, err.statusCode)
      if (onFailure) {
        onFailure('public key error' + err.message)
      }
    }
  }
}
