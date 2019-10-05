import { Component, OnInit, Input, OnDestroy } from '@angular/core'
import { OnDestroyComponent } from '@class/on-destroy'
import { Observable } from 'rxjs'
import { ObservableInput } from 'observable-input'

import hashbow from 'hashbow'
import { takeUntil } from 'rxjs/operators'

@Component({
  selector: 'app-dynamic-coin',
  templateUrl: './dynamic-coin.component.html',
  styleUrls: ['./dynamic-coin.component.css'],
})
export class DynamicCoinComponent extends OnDestroyComponent
  implements OnInit, OnDestroy {
  @Input()
  size: 'small' | 'normal' | 'big' = 'big'

  @Input()
  @ObservableInput()
  symbol: Observable<string>

  originalSymbol: string
  startCol: string
  stopCol: string

  ngOnInit() {
    this.symbol
      .pipe(takeUntil(this.destroy$)) // unsubscribe on destroy
      .subscribe(symbol => {
        this.originalSymbol = symbol.split('-')[0]
        this.startCol = hashbow(symbol[0])
        this.stopCol = hashbow(symbol[1])
      })
  }
}
