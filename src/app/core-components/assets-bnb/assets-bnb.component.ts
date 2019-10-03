import { Component, OnInit } from '@angular/core'
import { DialogComponent, DialogService } from 'ng2-bootstrap-modal'
import { BinanceService } from '@service/binance.service'
import { BehaviorSubject } from 'rxjs'

interface AssetsDialog {
  address: string
}

@Component({
  selector: 'app-assets-bnb',
  templateUrl: './assets-bnb.component.html',
  styleUrls: ['./assets-bnb.component.css'],
})
export class AssetsBnbComponent extends DialogComponent<AssetsDialog, boolean>
  implements AssetsDialog, OnInit {
  address: string
  private balances = new BehaviorSubject(null)
  balances$ = this.balances.asObservable()

  constructor(
    private binanceService: BinanceService,
    dialogService: DialogService
  ) {
    super(dialogService)
  }

  async ngOnInit() {
    const resp = await this.binanceService.client.getAccount(this.address)
    if (resp.status === 200) {
      this.balances.next(resp.result.balances)
    }
  }
}
