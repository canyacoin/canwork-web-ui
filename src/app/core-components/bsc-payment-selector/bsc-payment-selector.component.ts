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

import { BehaviorSubject } from 'rxjs'
import { sortBy, prop } from 'ramda'
import { take } from 'rxjs/operators'
import { OnDestroyComponent } from '@class/on-destroy'

import { BscService, EventTypeBsc, BepChain } from '@service/bsc.service'

import { environment } from '@env/environment'
//import { bepAssetData } from '@canpay-lib/lib' // todo

import { ToastrService } from 'ngx-toastr'

@Component({
  selector: 'app-bsc-payment-selector',
  templateUrl: './bsc-payment-selector.component.html',
  styleUrls: ['./bsc-payment-selector.component.css'],
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

  private assets = []
  address: string | boolean = true
  loading = true
  firstLoaded = false
  chain = BepChain.SmartChain
  quotes = {}

  constructor(
    private location: Location,
    private router: Router,
    private bscService: BscService,
    private toastr: ToastrService
  ) {
    super()
  }

  ngOnInit() {
    this.bscService.events$
      .pipe(take(1)) // unsubscribe on destroy
      .subscribe(async (event) => {
        if (!event) {
          this.address = false
          return
        }

        switch (event.type) {
          case EventTypeBsc.ConnectSuccess:
          case EventTypeBsc.AddressFound:
            this.address = event.details.address

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

            // for (let token in environment.bsc.assets) {
            //   try {
            //     let b = await this.bscService.getBalance(token)
            //     if (!b.err) {
            //       let asset = {
            //         converting: true,
            //         hasEnough: false,
            //         freeUsd: 0,
            //         ...b,
            //       }
            //       if (parseFloat(asset.free) == 0) asset.converting = false // no conversion with zero value

            //       this.assets.push(asset)
            //       this.firstLoaded = true // at least one loaded, show grid
            //     }
            //   } catch (err) {
            //     // make this function fail safe even if some contract is not correct or for another chain
            //     console.log(
            //       `Invalid contract for ${token}: ${environment.bsc.assets[token]}`
            //     )
            //     console.log(err)
            //   }
            // }

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
              this.firstLoaded = true // at least one loaded, show grid
            }

            this.loading = false // finish loading all

            // retrieve quotes
            this.quotes = await this.bscService.getCoingeckoQuotes()
            // we'll use it to calculate equivalent after balances are loaded

            // one by one, not blocking ui
            await this.checkUsdBalances()

            break
          case EventTypeBsc.Disconnect:
            this.address = false
            break

          case EventTypeBsc.ConnectConfirmationRequired:
            console.log(
              'bsc-payment-selector EventTypeBsc.ConnectConfirmationRequired'
            )
            this.address = false
            const routerStateSnapshot = this.router.routerState.snapshot
            this.toastr.warning(
              'Please connect your wallet before going on',
              '',
              { timeOut: 2000 }
            )
            this.router.navigate(['/wallet-bnb'], {
              queryParams: { returnUrl: routerStateSnapshot.url },
            })

            break
        }
      })
  }

  async checkUsdBalances() {
    console.log(this.quotes)
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
    this.bscAsset.emit(asset)
  }

  goBack() {
    if ((<any>window).history.length > 0) {
      this.location.back()
    } else {
      this.router.navigate(['/home'])
    }
  }
}
