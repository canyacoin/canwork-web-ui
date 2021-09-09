import { Location } from '@angular/common'
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { Router } from '@angular/router'

import { BehaviorSubject } from 'rxjs'
import { sortBy, prop } from 'ramda'
import { takeUntil } from 'rxjs/operators'
import { OnDestroyComponent } from '@class/on-destroy'

import { BscService, EventTypeBsc, BepChain } from '@service/bsc.service'

import { environment } from '@env/environment'
import { bepAssetData } from '@canpay-lib/lib' // todo


@Component({
  selector: 'app-bsc-payment-selector',
  templateUrl: './bsc-payment-selector.component.html',
  styleUrls: ['./bsc-payment-selector.component.css']
})
export class BscPaymentSelectorComponent extends OnDestroyComponent implements OnInit {
  @Input() jobBudgetUsd = 0
  @Output() bepAssetData: EventEmitter<bepAssetData> = new EventEmitter()
  
  private assets = []
  address: string | boolean = true
  loading = true
  chain = BepChain.SmartChain
  
  

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
            
            let balances = await this.bscService.getBalances();
            balances.sort((a, b) => parseFloat(b.free) - parseFloat(a.free));
            this.assets = balances;


            
            this.loading = false
          
          
          break
          case EventTypeBsc.Disconnect:
            this.address = false
          break
        
        }
    
      })    
  }
  
  goBack() {
    if ((<any>window).history.length > 0) {
      this.location.back()
    } else {
      this.router.navigate(['/home'])
    }
  }

}
