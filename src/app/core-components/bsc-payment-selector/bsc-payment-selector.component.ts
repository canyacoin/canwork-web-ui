import { Location } from '@angular/common'
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { Router } from '@angular/router'

import { BehaviorSubject } from 'rxjs'
import { sortBy, prop } from 'ramda'
import { take } from 'rxjs/operators'
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
  @Input() jobId = ''
  @Output() bscAsset: EventEmitter<any> = new EventEmitter()
  
  private assets = []
  address: string | boolean = true
  loading = true
  firstLoaded = false
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
      .pipe(take(1)) // unsubscribe on destroy
      .subscribe(async event => {
        
        if (!event) {
          this.address = false
          return
        }

        switch (event.type) {
          case EventTypeBsc.ConnectSuccess:          
          case EventTypeBsc.AddressFound:
          
          
            this.address = event.details.address
            
            this.assets = [];


            for (let token in environment.bsc.assets) {
              let b = await this.bscService.getBalance(token);
              if (!b.err) {
                let asset = { converting: true, hasEnough: false, freeUsd: 0, ...b }
                if (parseFloat(asset.free) == 0) asset.converting = false; // no conversion with zero value
                
                this.assets.push(asset);
                this.firstLoaded = true // at least one loaded, show grid

              }
            }
            
            this.loading = false; // finish loading all
            
            
            // one by one, not blocking ui
            await this.checkUsdBalances()
            await this.estimateGasApprove()
            await this.estimateGasDeposit()
          
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
          this.assets[i].token
        );
        
        if (busdEquivalent > 0) {
          let busdValue = parseFloat(busdEquivalent.toString());
          if (busdValue >= this.jobBudgetUsd) {
            this.assets[i].hasEnough = true;
            this.assets[i].isApproved = false; // first step is approve
            this.assets[i].gasApprove = '';
            this.assets[i].gasDeposit = '';
                      }
          this.assets[i].busdValue = busdValue; // raw, needed later
          this.assets[i].freeUsd = "$ "+ busdValue.toFixed(2);
          
        } else {
          this.assets[i].freeUsd = 'na';          
        }
        this.assets[i].converting = false;
      }
      
    }
    
  }

  async estimateGasApprove() {
    for (let i=0; i<this.assets.length; i++) {
      if (this.assets[i].hasEnough && (this.assets[i].gasApprove == '')) {
        let allowance = this.jobBudgetUsd / this.assets[i].busdValue; // how much we need
        let gasApprove = await this.bscService.estimateGasApprove(this.assets[i].token, allowance);
        if (parseFloat(gasApprove) >= 0) this.assets[i].gasApprove = `~${parseFloat(gasApprove).toFixed(4)}`;
      }
    }
  }
  
  async estimateGasDeposit() {
    // estimate silently for all, if it succeeds, it means asset is already approved
    for (let i=0; i<this.assets.length; i++) {
      if (this.assets[i].hasEnough && (this.assets[i].gasDeposit == '')) {
        let allowance = this.jobBudgetUsd / this.assets[i].busdValue; // how much we need
        let gasDeposit = await this.bscService.estimateGasDeposit(this.assets[i].token, allowance, this.jobId, true);
        if (parseFloat(gasDeposit) >= 0) {
          // if it succeds, it means asset is approved
          this.assets[i].isApproved = true;
          this.assets[i].gasDeposit = `~${parseFloat(gasDeposit).toFixed(4)}`;
        }
      }
    }
  }

  async approve(asset) {
    if (!asset.converting && asset.hasEnough && !asset.isApproved) {
      let allowance = this.jobBudgetUsd / asset.busdValue; // how much we need
      let result = await this.bscService.approve(asset.token, allowance);
      // check result and approve into controller state
      if (!result.err) {
        asset.isApproved = true;
        // estimateGasDeposit after approval, wait a bit to give time to chain to get approval register
        await new Promise(r => setTimeout(r, 500));
        let gasDeposit = await this.bscService.estimateGasDeposit(asset.token, allowance, this.jobId, false);
        if (parseFloat(gasDeposit) >= 0) asset.gasDeposit = `~${parseFloat(gasDeposit).toFixed(4)}`;        
      }
    } else {
      console.log(asset);
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
