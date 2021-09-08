import { Location } from '@angular/common'
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { Router } from '@angular/router'

import { BehaviorSubject } from 'rxjs'
import { sortBy, prop } from 'ramda'
import { takeUntil } from 'rxjs/operators'
import { OnDestroyComponent } from '@class/on-destroy'

import { BscService, EventTypeBsc } from '@service/bsc.service'

import { environment } from '@env/environment'


@Component({
  selector: 'app-bsc-payment-selector',
  templateUrl: './bsc-payment-selector.component.html',
  styleUrls: ['./bsc-payment-selector.component.css']
})
export class BscPaymentSelectorComponent extends OnDestroyComponent implements OnInit {
  @Input() jobBudgetUsd = 0
  private availableAssets = new BehaviorSubject(null)
  address: string | boolean = true
  loading = true
  
  

  constructor(
    private location: Location,
    private router: Router,
    private bscService: BscService
  ) { 
    super()
  }

  ngOnInit() {      
      this.bscService.events$
      .pipe(takeUntil(this.destroy$)) // unsubscribe on destroy
      .subscribe(async event => {
        
        if (!event) {
          this.address = false
          return
        }

        switch (event.type) {
          case EventTypeBsc.ConnectSuccess:          
          case EventTypeBsc.AddressFound:
            this.address = event.details.address
                        
            this.availableAssets.next(sortBy(prop('symbol'))(await this.bscService.getBalances()))
            // todo here enrich balances with usd value, as done into getAvailableAssets
            // but one by one, async and not ui blocking, invoking pancakeswap smart contract

            
            this.loading = false
          
          
          break
          case EventTypeBsc.Disconnect:
            this.address = false
          break
        
        }
    
      })    
  }
  


}
