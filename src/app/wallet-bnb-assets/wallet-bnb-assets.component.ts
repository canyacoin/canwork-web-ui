import { Component, OnInit } from '@angular/core'
import { BinanceService, EventType } from '@service/binance.service'
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
  explorer = environment.binance.explorer

  constructor(private binanceService: BinanceService) {
    super()
  }

  async ngOnInit() {
    this.binanceService.events$
      .pipe(takeUntil(this.destroy$)) // unsubscribe on destroy
      .subscribe(async event => {
        if (!event) {
          this.address = false
          return
        }

        switch (event.type) {
          case EventType.Connect:
          case EventType.Update:
            this.address = event.details.address
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
