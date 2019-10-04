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
  private balances = new BehaviorSubject(null)

  constructor(private binanceService: BinanceService) {}

  async ngOnInit() {
    // test address
    // 'bnb1rzxnwxu25hrfv9d3mp25kfyace7j8ez6m5dwkk'
    const address: string = await this.binanceService.getAddress()
    const resp = await this.binanceService.client.getAccount(address)
    if (resp.status === 200) {
      this.balances.next(sortBy(prop('symbol'))(resp.result.balances))
    }
  }
}
