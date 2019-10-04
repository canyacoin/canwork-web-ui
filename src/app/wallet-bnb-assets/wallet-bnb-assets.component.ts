import { Component, OnInit } from '@angular/core'
import { BinanceService } from '@service/binance.service'
import { BehaviorSubject } from 'rxjs'
import { sortBy, prop } from 'ramda'

@Component({
  selector: 'app-wallet-bnb-assets',
  templateUrl: './wallet-bnb-assets.component.html',
  styleUrls: ['./wallet-bnb-assets.component.css'],
})
export class WalletBnbAssetsComponent implements OnInit {
  address: string = 'bnb1rzxnwxu25hrfv9d3mp25kfyace7j8ez6m5dwkk'
  private balances = new BehaviorSubject(null)

  constructor(private binanceService: BinanceService) {}

  async ngOnInit() {
    const resp = await this.binanceService.client.getAccount(this.address)
    if (resp.status === 200) {
      this.balances.next(sortBy(prop('symbol'))(resp.result.balances))
    }
  }
}
