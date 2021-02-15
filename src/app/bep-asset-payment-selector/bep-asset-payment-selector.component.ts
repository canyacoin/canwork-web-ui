import { Location } from '@angular/common'
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { Router } from '@angular/router'
import { BinanceService, EventType } from '@service/binance.service'
import { BehaviorSubject } from 'rxjs'
import { sortBy, prop } from 'ramda'
import { takeUntil } from 'rxjs/operators'
import { OnDestroyComponent } from '@class/on-destroy'

import { environment } from '@env/environment'
import { bepAssetData } from '@canpay-lib/lib'

@Component({
  selector: 'app-bep-asset-payment-selector',
  templateUrl: './bep-asset-payment-selector.component.html',
  styleUrls: ['./bep-asset-payment-selector.component.css'],
})
export class BepAssetPaymentSelectorComponent extends OnDestroyComponent
  implements OnInit {
  @Input() jobBudgetUsd = 0
  @Output() bepAssetData: EventEmitter<bepAssetData> = new EventEmitter()

  address: string | boolean = true
  private availableAssets = new BehaviorSubject(null)
  explorer = environment.binance.explorer
  loading = true

  constructor(
    private location: Location,
    private router: Router,
    private binanceService: BinanceService
  ) {
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
          case EventType.ConnectSuccess:
          case EventType.Update:
            this.address = event.details.address
            const resp = await this.binanceService.client.getAccount(
              this.address
            )

            let balances = []
            let availableAssets = []

            // if resp is NULL, it can be just a valid new address never used before
            if (resp !== null && resp.status === 200) {
              //gets wallet balances
              balances = resp.result.balances
              //calls function to get only free balances that can cover job budget
              availableAssets = await this.getAvailableAssets(balances)
              console.log('freeUsd: ' + availableAssets[0].freeUsd)
            }

            //sorts assets by symbol
            this.availableAssets.next(sortBy(prop('symbol'))(availableAssets))

            this.loading = false
            break
          case EventType.Disconnect:
            this.address = false
            break
        }
      })
  }

  async getAvailableAssets(balances) {
    console.log('Getting available balances...')
    console.log(balances)
    let availableAssets = []
    let hasEnough: boolean
    let usdPeggedCoin = ['BUSD-BD1', 'BUSD-BAF'] // Hardcoded USD Coin array -- suggest changes. Other USD Pegged coins exist.

    for (const balance of balances) {
      let usdPrice = 0
      // Get weighted avg USD price of each asset (except BUSD)
      if (!usdPeggedCoin.includes(balance.symbol)) {
        try {
          usdPrice = await this.binanceService.getAssetToUsd(balance.symbol)
          console.log(balance.symbol + ' usdPrice: ' + usdPrice)
        } catch (error) {
          console.error(error)
          usdPrice = 0
        }
      } else {
        usdPrice = 1
      }

      // Calculate USD value of each asset's free balance (not including locked)
      const freeAssetToUsd = Number((balance.free * usdPrice).toPrecision(8))
      if (freeAssetToUsd < 5) {
        continue
      }

      // Determine if the asset's free USD value is enough to cover the job budget
      if (this.jobBudgetUsd > freeAssetToUsd) {
        hasEnough = false
      } else {
        hasEnough = true
      }

      availableAssets.push({
        symbol: balance.symbol,
        free: balance.free,
        freeUsd: freeAssetToUsd,
        usdPrice: usdPrice,
        hasEnough: hasEnough,
      })
    }

    return availableAssets
  }

  async paymentSelected(asset) {
    // Get payment asset icon URL
    const iconURL = await this.binanceService.getAssetIconUrl(asset.symbol)
    console.log(iconURL)

    let assetData = {
      symbol: asset.symbol,
      iconURL: iconURL,
      freeAsset: asset.free,
      freeUsd: asset.freeUsd,
      usdPrice: asset.usdPrice,
    }

    this.bepAssetData.emit(assetData)
  }

  goBack() {
    if ((<any>window).history.length > 0) {
      this.location.back()
    } else {
      this.router.navigate(['/home'])
    }
  }
}
