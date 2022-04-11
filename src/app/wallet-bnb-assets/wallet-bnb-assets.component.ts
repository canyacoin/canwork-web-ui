import { Component, OnInit } from '@angular/core'
import { BinanceService, EventType } from '@service/binance.service'
import { BscService, EventTypeBsc, BepChain } from '@service/bsc.service'

import { BehaviorSubject } from 'rxjs'
import { sortBy, prop } from 'ramda'
import { takeUntil } from 'rxjs/operators'

import { OnDestroyComponent } from '@class/on-destroy'
import { environment } from '@env/environment'

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
  chain = null

  constructor(
    private binanceService: BinanceService,
    private bscService: BscService
  ) {
    super()
  }

  async forget() {
    switch (this.chain) {
      case BepChain.Binance:
        this.binanceService.disconnect()
        break
      case BepChain.SmartChain:
        this.bscService.disconnect()
        break
    }
  }

  async ngOnInit() {
    this.bscService.events$
      .pipe(takeUntil(this.destroy$)) // unsubscribe on destroy
      .subscribe(async event => {
        if (!event) {
          if (!this.chain) this.address = false
          return
        }
        switch (event.type) {
          case EventTypeBsc.ConnectSuccess:          
          case EventTypeBsc.AddressFound:
            this.chain = BepChain.SmartChain
            this.address = event.details.address
            this.explorer = environment.bsc.blockExplorerUrls[0]
            this.balances.next(sortBy(prop('symbol'))(await this.bscService.getBalances()))
            break
          case EventTypeBsc.Disconnect:
          console.log('disconnect event')
            this.address = false
            this.balances.next([])
            this.chain = null            
            break
            
        }

      })


    this.binanceService.events$
      .pipe(takeUntil(this.destroy$)) // unsubscribe on destroy
      .subscribe(async event => {
        if (!event) {
          if (!this.chain) this.address = false
          return
        }

        switch (event.type) {
          case EventType.ConnectSuccess:
          case EventType.Update:
            this.chain = BepChain.Binance         
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
            /*
            // do not sort anymore to be coherent with payment selector
            // env config ordering will be respected, so this can be choosen into config
            this.balances.next(sortBy(prop('symbol'))(balances))
            */
            break
          case EventType.Disconnect:
            this.address = false
            this.balances.next(null)            
            this.chain = null
            break
        }
      })
  }
}
