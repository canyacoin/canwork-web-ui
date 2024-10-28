import { Component, OnInit, Input, OnDestroy, Directive } from '@angular/core'
import { OnDestroyComponent } from '@class/on-destroy'
import { Observable } from 'rxjs'
import { ObservableInput } from 'observable-input'
import { BepChain } from '@service/bsc.service'

import hashbow from 'hashbow'
import { takeUntil } from 'rxjs/operators'

export enum ImageState {
  Loading,
  Error,
  Loaded,
}

@Component({
  selector: 'dynamic-coin',
  templateUrl: './dynamic-coin.component.html',
})
export class DynamicCoinComponent
  extends OnDestroyComponent
  implements OnInit, OnDestroy
{
  @Input()
  size: 'small' | 'normal' | 'big' = 'big'

  @Input()
  @ObservableInput()
  symbol: Observable<string>

  @Input()
  network: BepChain.SmartChain = BepChain.SmartChain

  @Input()
  address?: string // bsc

  originalSymbol: string
  symbolUrl: string
  startCol: string
  stopCol: string
  imageState: ImageState = ImageState.Loading
  ImageState = ImageState

  ngOnInit() {
    this.symbol
      .pipe(takeUntil(this.destroy$)) // unsubscribe on destroy
      .subscribe((symbol) => {
        // if (this.network === BepChain.Binance) {
        //   if (symbol === 'BNB')
        //     this.symbolUrl =
        //       'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/info/'
        //   else
        //     this.symbolUrl =
        //       'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/' +
        //       symbol
        //   this.originalSymbol = symbol.split('-')[0]
        //   this.startCol = hashbow(symbol[0])
        //   this.stopCol = hashbow(symbol[1])

        //   return
        // }

        if (this.network === BepChain.SmartChain) {
          this.originalSymbol = symbol
          this.startCol = hashbow(symbol)
          this.stopCol = hashbow(this.address)
          // case must match exactly the one on github path
          if (symbol === 'BNB')
            this.symbolUrl =
              'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/info/'
          else
            this.symbolUrl =
              'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/' +
              this.address

          return
        }
      })
  }
}
