import { Location } from '@angular/common'
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  Directive,
} from '@angular/core'
import { Router } from '@angular/router'

import { OnDestroyComponent } from '@class/on-destroy'

import { BscService, EventTypeBsc, BepChain } from '@service/bsc.service'

import { environment } from '@env/environment'
//import { bepAssetData } from '@canpay-lib/lib' // todo

// for sleep
import { timer } from 'rxjs'
import { take } from 'rxjs/operators'

import { MessageService } from 'primeng/api'

@Component({
  selector: 'bsc-payment-selector',
  templateUrl: './bsc-payment-selector.component.html',
})
export class BscPaymentSelectorComponent
  extends OnDestroyComponent
  implements OnInit
{
  @Input() jobBudgetUsd = 0
  @Input() jobTitle: string
  @Input() jobId = ''
  @Input() providerAddress = ''
  @Output() bscAsset: EventEmitter<any> = new EventEmitter()

  assets = []
  loading: boolean = true
  address: string = ''
  chain = BepChain.SmartChain
  quotes = {}
  totalBudget: number = 0
  explorer = ''

  visibleConnectWalletModal = false

  constructor(
    private location: Location,
    private router: Router,
    private bscService: BscService,
    private messageService: MessageService
  ) {
    super()
  }

  async ngOnInit() {
    await this.walletRefresh()
  }

  async walletRefresh() {
    this.bscService.events$
      .pipe(take(1)) // unsubscribe on destroy
      .subscribe(async (event) => {
        if (!event) {
          this.loading = false
          return
        }

        switch (event.type) {
          case EventTypeBsc.ConnectSuccess:
          case EventTypeBsc.AddressFound:
            this.address = event.details.address
            this.explorer = environment.bsc.blockExplorerUrls[0]

            this.assets = []

            // add BNB
            let bnbBalance = await this.bscService.getBnbBalance()

            this.assets.push({
              converting: true,
              hasEnough: false,
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
                hasEnough: false,
                freeUsd: 0,
                ...awaitArray[i],
              }
              if (parseFloat(asset.free) == 0) asset.converting = false // no conversion with zero value

              this.assets.push(asset)
            }

            // retrieve quotes
            this.quotes = await this.bscService.getCoingeckoQuotes()
            // we'll use it to calculate equivalent after balances are loaded

            // one by one, not blocking ui
            await this.checkUsdBalances()

            break
          case EventTypeBsc.Disconnect:
            break

          case EventTypeBsc.ConnectConfirmationRequired:
            console.log(
              'bsc-payment-selector EventTypeBsc.ConnectConfirmationRequired'
            )
            const routerStateSnapshot = this.router.routerState.snapshot
            this.messageService.add({
              severity: 'warn',
              summary: 'Warn',
              detail: 'Please connect your wallet before going on',
            })
            this.router.navigate(['/wallet-bnb'], {
              queryParams: { returnUrl: routerStateSnapshot.url },
            })

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

        // new sept 2023, tether
        let usdtEquivalent =
          parseFloat(this.assets[i].free) * this.quotes[this.assets[i].token]

        if (usdtEquivalent > 0) {
          console.log('usdtEquivalent', usdtEquivalent)
          this.totalBudget += usdtEquivalent
          let usdtValue = parseFloat(usdtEquivalent.toString())
          if (usdtValue < this.jobBudgetUsd)
            this.assets[i].seemsNotEnough = true
          else this.assets[i].seemsNotEnough = false

          this.assets[i].hasEnough = true
          this.assets[i].isApproved = false // first step is approve
          this.assets[i].gasApprove = ''
          this.assets[i].gasDeposit = ''
          this.assets[i].usdtValue = usdtValue
          this.assets[i].freeUsd = usdtValue.toFixed(2)
        } else {
          this.assets[i].freeUsd = 'na'
        }
        this.assets[i].converting = false
      }
    }
  }

  async approve(asset) {
    if (!asset.converting && asset.hasEnough && !asset.isApproved) {
      console.log('Needed allowance: ' + asset.allowance)
      // we have to ask allowance increase, so it's better to add 10% already to handle market fluctuations if trying payment more times
      const safetyAllowance = asset.allowance * 1.1

      console.log('Safety allowance (+10%): ' + safetyAllowance)

      let result = await this.bscService.approve(asset.token, safetyAllowance)
      // check result and approve into controller state
      if (!result.err) {
        asset.isApproved = true
        // estimateGasDeposit after approval
        let estimateResult = await this.bscService.estimateGasDeposit(
          asset.token,
          this.providerAddress,
          asset.allowance,
          this.jobId,
          this.jobTitle,
          false
        )
        if (parseFloat(estimateResult.gasDeposit) >= 0)
          asset.gasDeposit = `~${parseFloat(estimateResult.gasDeposit).toFixed(
            4
          )}<br>${estimateResult.pathAssets.join('->')}`
      }
    } else {
      console.log(asset)
    }
  }

  async paymentSelected(asset) {
    if (!asset.converting && asset.hasEnough && !asset.seemsNotEnough) {
      this.bscAsset.emit(asset)
    }
  }

  goBack() {
    if ((<any>window).history.length > 0) {
      this.location.back()
    } else {
      this.router.navigate(['/home'])
    }
  }

  sleepRx(ms: number) {
    return timer(ms).pipe(take(1)).toPromise()
  }

  async refresh(event: Event) {
    event?.preventDefault()
    this.loading = true
    this.totalBudget = 0
    this.assets = []
    await this.sleepRx(1000)
    this.walletRefresh()
  }

  copy(event: Event) {
    event.preventDefault()
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Successfully copied wallet address.',
    })
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
