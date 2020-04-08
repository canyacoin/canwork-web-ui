import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { BinanceService, EventType } from '@service/binance.service'
import { BehaviorSubject } from 'rxjs'
import { sortBy, prop } from 'ramda'
import { takeUntil } from 'rxjs/operators'
import { OnDestroyComponent } from '@class/on-destroy'

import { environment } from '@env/environment'
import { BepAssetPaymentData } from '@canpay-lib/lib'

@Component({
  selector: 'app-bep-asset-payment-selector',
  templateUrl: './bep-asset-payment-selector.component.html',
  styleUrls: ['./bep-asset-payment-selector.component.css'],
})
export class BepAssetPaymentSelectorComponent extends OnDestroyComponent
  implements OnInit {
  @Input() jobBudgetUsd = 0
  @Output() bepAssetPaymentData: EventEmitter<
    BepAssetPaymentData
  > = new EventEmitter()

  address: string | boolean = true
  private availableAssets = new BehaviorSubject(null)
  explorer = environment.binance.explorer
  loading = true

  constructor(private binanceService: BinanceService) {
    super()
  }

  async ngOnInit() {
    console.log('BEP ASSET PAYMENT SELECTOR')
    console.log('Job Budget $USD: ' + this.jobBudgetUsd)
    this.binanceService.events$
      .pipe(takeUntil(this.destroy$)) // unsubscribe on destroy
      .subscribe(async event => {
        if (!event) {
          this.address = false
          return
        }

        switch (event.type) {
          case EventType.ConnectSuccess:
          case EventType.Update:
            this.address = event.details.address
            const resp = await this.binanceService.client.getAccount(
              this.address
            )
            console.log('GETTING BALANCES...')
            // if resp is NULL, it can be just a valid new address never used before
            let balances = []
            let availableAssets = []
            if (resp !== null && resp.status === 200) {
              balances = resp.result.balances
              availableAssets = await this.getAvailableAssets(balances)
            }

            this.availableAssets.next(sortBy(prop('symbol'))(availableAssets))
            this.loading = false
            console.log(this.availableAssets)
            break
          case EventType.Disconnect:
            this.address = false
            break
        }
      })
  }

  async getAvailableAssets(balances) {
    let availableAssets = []
    let hasEnough: boolean

    for (const balance of balances) {
      // Get weighted avg USD price of each asset and calculate USD value
      const usdPrice = await this.binanceService.getAssetToUsd(balance.symbol) //get assets USD price
      const freeAssetToUsd = balance.free * usdPrice

      // Determine if the assets USD value is enough to cover the job budget
      if (this.jobBudgetUsd > freeAssetToUsd) {
        hasEnough = false
      } else {
        hasEnough = true
      }

      availableAssets.push({
        symbol: balance.symbol,
        free: balance.free,
        usdValue: freeAssetToUsd,
        usdPrice: usdPrice,
        hasEnough: hasEnough,
      })
    }
    return availableAssets
  }

  async paymentSelected(asset) {
    let assetData = {
      symbol: asset.symbol,
      freeAsset: asset.free,
      usdValue: asset.usdValue,
      usdPrice: asset.usdPrice,
    }
    this.bepAssetPaymentData.emit(assetData)
  }
}
