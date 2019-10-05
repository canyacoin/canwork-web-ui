import { Component, OnInit } from '@angular/core'
import { BinanceService, EventType } from '@service/binance.service'
import { BehaviorSubject } from 'rxjs'
import { sortBy, prop } from 'ramda'
import { OnDestroyComponent } from '@class/on-destroy'
import { takeUntil } from 'rxjs/operators'

@Component({
  selector: 'app-wallet-bnb-assets',
  templateUrl: './wallet-bnb-assets.component.html',
  styleUrls: ['./wallet-bnb-assets.component.css'],
})
export class WalletBnbAssetsComponent extends OnDestroyComponent
  implements OnInit {
  address: string | boolean = true
  private balances = new BehaviorSubject(null)

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
            // test address
            // 'bnb1rzxnwxu25hrfv9d3mp25kfyace7j8ez6m5dwkk'
            this.address = event.details.address
            const resp = await this.binanceService.client.getAccount(
              this.address
            )
            if (resp.status === 200) {
              this.balances.next(sortBy(prop('symbol'))(resp.result.balances))
            }
            break
          case EventType.Disconnect:
            this.address = false
            break
        }
      })
  }
}
