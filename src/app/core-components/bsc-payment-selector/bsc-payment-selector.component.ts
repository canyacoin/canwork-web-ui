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
            balances.forEach((b) => {
              if (parseFloat(b.free) == 0) { // no jobs with zero value
                b.converting = false;
                b.hasEnough = false;
                b.freeUsd = 0;
              } else b.converting = true;
            });
            this.assets = balances;
            console.log(this.assets);
            


            
            this.loading = false
            // global loading end, now verify usd equivalents and if are enough
            await this.checkUsdBalances()
          
          break
          case EventTypeBsc.Disconnect:
            this.address = false
          break
        
        }
    
      })    
  }
  
  async checkUsdBalances() {

    for (let i=0; i<this.assets.length; i++) {
      if (this.assets[i].converting) {
        let busdEquivalent = await this.bscService.getBusdValue(
          parseFloat(this.assets[i].free),
          this.assets[i].address
        );
        
        if (busdEquivalent > 0) {
          let busdValue = parseFloat(busdEquivalent.toString());
          if (busdValue >= this.jobBudgetUsd) this.assets[i].hasEnough = true;
          this.assets[i].freeUsd = "$ "+ busdValue.toFixed(2);
          
        } else {
          this.assets[i].freeUsd = 'na';          
        }
        this.assets[i].converting = false;
      }
      
    }
    
  }
  
  goBack() {
    if ((<any>window).history.length > 0) {
      this.location.back()
    } else {
      this.router.navigate(['/home'])
    }
  }

}
