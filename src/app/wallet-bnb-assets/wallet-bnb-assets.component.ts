import { Component, OnInit, Directive } from '@angular/core'
import { BscService, EventTypeBsc, BepChain } from '@service/bsc.service'

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
  address: string | boolean = true
  private balances = new BehaviorSubject(null)
  explorer = ''
  chain = null

  totalBudget: number = 0

  constructor(
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
      .pipe(takeUntil(this.destroy$)) // unsubscribe on destroy
      .subscribe(async (event) => {
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
            /*
            // do not sort anymore to be coherent with payment selector
            // env config ordering will be respected, so this can be choosen into config
            this.balances.next(sortBy(prop('symbol'))(await this.bscService.getBalances()))
            */
            this.balances.next(await this.bscService.getBalances())

            break
          case EventTypeBsc.Disconnect:
            console.log('disconnect event')
            this.address = false
            this.balances.next([])
            this.chain = null
            break
          case EventTypeBsc.ConnectConfirmationRequired:
            console.log(
              'wallet-bnb-assets EventTypeBsc.ConnectConfirmationRequired'
            )
            // disconnect and reconnect, more safe
            this.address = false
            this.balances.next([])
            this.chain = null

            break
        }
      })
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
    event.preventDefault()
    this.balances = new BehaviorSubject(null)
    await this.sleepRx(1000)
    this.walletRefresh()
  }

  async forget() {
    switch (this.chain) {
      case BepChain.SmartChain:
        await this.bscService.disconnect()
        break
    }
  }
}
