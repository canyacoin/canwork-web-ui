import { Component, OnInit } from '@angular/core'
import { BinanceService, EventType } from '@service/binance.service'
import { BscService, EventTypeBsc } from '@service/bsc.service'

import { BehaviorSubject } from 'rxjs'
import { sortBy, prop } from 'ramda'
import { takeUntil } from 'rxjs/operators'

import { OnDestroyComponent } from '@class/on-destroy'
import { environment } from '@env/environment'

enum NetworkType {
  Binance,
  Bsc
}

@Component({
  selector: 'app-wallet-bnb-assets',
  templateUrl: './wallet-bnb-assets.component.html',
  styleUrls: ['./wallet-bnb-assets.component.css'],
})
export class WalletBnbAssetsComponent extends OnDestroyComponent
  implements OnInit {
  address: string | boolean = true
  private balances = new BehaviorSubject(null)
  explorer = ''
  networkType = null

  constructor(
    private binanceService: BinanceService,
    private bscService: BscService
  ) {
    super()
  }

  async forget() {
    switch (this.networkType) {
      case NetworkType.Binance:
        this.binanceService.disconnect()
        break
      case NetworkType.Bsc:
        this.bscService.disconnect()
        break
    }
  }

  async ngOnInit() {
    this.bscService.events$
      .pipe(takeUntil(this.destroy$)) // unsubscribe on destroy
      .subscribe(async event => {
        if (!event) {
          if (!this.networkType) this.address = false
          return
        }
        switch (event.type) {
          case EventTypeBsc.ConnectSuccess:          
          case EventTypeBsc.AddressFound:
            this.networkType = NetworkType.Bsc
            this.address = event.details.address
            this.explorer = environment.bsc.blockExplorerUrls[0]
            this.balances.next([]) // todo
            break
          case EventTypeBsc.Disconnect:
            this.address = false
            this.balances.next(null)
            break
            
        }

      })


    this.binanceService.events$
      .pipe(takeUntil(this.destroy$)) // unsubscribe on destroy
      .subscribe(async event => {
        if (!event) {
          if (!this.networkType) this.address = false
          return
        }

        switch (event.type) {
          case EventType.ConnectSuccess:
          case EventType.Update:
            this.networkType = NetworkType.Binance          
            this.address = event.details.address
            this.explorer = environment.binance.explorer            
            const resp = await this.binanceService.client.getAccount(
              this.address
            )
            // if resp is NULL, it can be just a valid new address never used before
            let balances = []
            if (resp !== null && resp.status === 200) {
              balances = resp.result.balances
            }
            this.balances.next(sortBy(prop('symbol'))(balances))
            break
          case EventType.Disconnect:
            this.address = false
            break
        }
      })
  }
}
