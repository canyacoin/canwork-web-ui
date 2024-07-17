import {
  Component,
  OnInit,
  Directive,
  EnvironmentInjector,
} from '@angular/core'
import { BscService, EventTypeBsc, BepChain } from '@service/bsc.service'
import { ActivatedRoute, Router } from '@angular/router'

import { BehaviorSubject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'

import { OnDestroyComponent } from '@class/on-destroy'
import { environment } from '@env/environment'
import { MessageService } from 'primeng/api'

// for sleep
import { timer } from 'rxjs'
import { take } from 'rxjs/operators'

@Component({
  selector: 'app-wallet-bnb-assets',
  templateUrl: './wallet-bnb-assets.component.html',
})
export class WalletBnbAssetsComponent
  extends OnDestroyComponent
  implements OnInit
{
  loading: boolean = true
  address: string = ''
  assets = []
  explorer = ''
  chain = BepChain.SmartChain
  quotes = {}

  totalBudget: number = 0

  visibleConnectWalletModal = false

  returnUrl: string

  constructor(
    private bscService: BscService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    super()
  }

  async ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl']
    // console.log('this.returnUrl:', this.returnUrl)
    await this.walletRefresh()
  }
  async walletRefresh() {
    this.totalBudget = 0
    this.assets = []

    this.bscService.events$
      .pipe(take(1)) // unsubscribe on destroy
      .subscribe(async (event) => {
        if (!event) {
          if (!this.chain) this.loading = false
          return
        }
        switch (event.type) {
          case EventTypeBsc.ConnectSuccess:
            console.log(this.returnUrl)
            if (this.returnUrl !== undefined) {
              this.router.navigate([this.returnUrl])
            }
          case EventTypeBsc.AddressFound:
            this.address = event.details.address
            this.explorer = environment.bsc.blockExplorerUrls[0]

            // add BNB
            let bnbBalance = await this.bscService.getBnbBalance()

            this.assets.push({
              converting: true,
              freeUsd: 0,
              name: 'BNB',
              symbol: 'BNB',
              address: '',
              free: bnbBalance,
              err: '',
              token: 'BNB',
            })

            let awaitArray = []

            for (let token in environment.bsc.assets) {
              awaitArray.push(this.bscService.getBalance(token))
            }
            awaitArray = await Promise.all(awaitArray)

            for (let i = 0; i < awaitArray.length; i++) {
              let asset = {
                converting: true,
                freeUsd: 0,
                ...awaitArray[i],
              }
              if (parseFloat(asset.free) === 0) asset.converting = false // no conversion with zero value

              this.assets.push(asset)
            }

            // retrieve quotes
            this.quotes = await this.bscService.getCoingeckoQuotes()
            // we'll use it to calculate equivalent after balances are loaded

            // one by one, not blocking ui
            await this.checkUsdBalances()

            break
          case EventTypeBsc.Disconnect:
            console.log('disconnect event')

            break
          case EventTypeBsc.ConnectConfirmationRequired:
            console.log(
              'wallet-bnb-assets EventTypeBsc.ConnectConfirmationRequired'
            )
            // disconnect and reconnect, more safe

            break
        }
      })
    this.loading = false
  }

  async checkUsdBalances() {
    for (let i = 0; i < this.assets.length; i++) {
      if (
        this.assets[i].converting &&
        this.quotes.hasOwnProperty(this.assets[i].token)
      ) {
        // let busdEquivalent = parseFloat(this.assets[i].free) * this.quotes[this.assets[i].token]

        let usdtEquivalent =
          parseFloat(this.assets[i].free) * this.quotes[this.assets[i].token]

        if (usdtEquivalent > 0) {
          this.totalBudget += usdtEquivalent
          let usdtValue = parseFloat(usdtEquivalent.toString())

          this.assets[i].usdtValue = usdtValue
          this.assets[i].freeUsd = usdtValue.toFixed(2)
        } else {
          // this.assets[i].freeUsd = 'na'
          this.assets[i].freeUsd = 0
        }
        this.assets[i].converting = false
      }
    }
  }

  copy(event: Event) {
    event.preventDefault()
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Successfully copied wallet address.',
    })
  }

  sleepRx(ms: number) {
    return timer(ms).pipe(take(1)).toPromise()
  }

  async refresh(event: Event) {
    event?.preventDefault()
    this.loading = true
    // await this.sleepRx(1000)
    this.walletRefresh()
  }

  async forget(event: Event) {
    event.preventDefault()
    this.loading = false
    this.assets = []
    this.totalBudget = 0
    this.address = ''
    switch (this.chain) {
      case BepChain.SmartChain:
        await this.bscService.disconnect()
        break
    }
  }

  connectWallet(event: Event) {
    event.preventDefault()
    this.visibleConnectWalletModal = true
  }
}
