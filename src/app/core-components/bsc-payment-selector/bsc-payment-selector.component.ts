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

import { ToastrService } from 'ngx-toastr'



@Component({
  selector: 'app-bsc-payment-selector',
  templateUrl: './bsc-payment-selector.component.html',
  styleUrls: ['./bsc-payment-selector.component.css']
})
export class BscPaymentSelectorComponent extends OnDestroyComponent implements OnInit {
  @Input() jobBudgetUsd = 0
  @Input() jobId = ''
  @Input() providerAddress = ''
  @Output() bscAsset: EventEmitter<any> = new EventEmitter()
  
  private assets = []
  address: string | boolean = true
  loading = true
  firstLoaded = false
  chain = BepChain.SmartChain
  
  

  constructor(
    private location: Location,
    private router: Router,
    private bscService: BscService,
    private toastr: ToastrService
    
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
            
            
            // add BNB
            let bnbBalance = await this.bscService.getBnbBalance();

            this.assets.push({
              converting: true,
              hasEnough: false,
              freeUsd: 0,
              name: 'BNB',
              symbol: 'BNB',
              address: '',
              free: bnbBalance,
              err: '',
              token: 'BNB'
            });
            

            for (let token in environment.bsc.assets) {
              try {
              
                let b = await this.bscService.getBalance(token);
                if (!b.err) {
                  let asset = { converting: true, hasEnough: false, freeUsd: 0, ...b }
                  if (parseFloat(asset.free) == 0) asset.converting = false; // no conversion with zero value
                  
                  this.assets.push(asset);
                  this.firstLoaded = true // at least one loaded, show grid

                }
              } catch(err) {
                // make this function fail safe even if some contract is not correct or for another chain
                console.log(`Invalid contract for ${token}: ${environment.bsc.assets[token]}`);
                console.log(err);
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
          
          case EventTypeBsc.ConnectConfirmationRequired:
            console.log("bsc-payment-selector EventTypeBsc.ConnectConfirmationRequired")
            this.address = false
            const routerStateSnapshot = this.router.routerState.snapshot
            this.toastr.warning(
              'Please connect your wallet before going on',
              '',
              { timeOut: 2000 }
            )
            this.router.navigate(['/wallet-bnb'], {
              queryParams: { returnUrl: routerStateSnapshot.url },
            })            
            
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
            this.assets[i].busdValue = busdValue;
            this.assets[i].freeUsd = "$ "+ busdValue.toFixed(2);

            // calculate and save needed allowance
            let allowance = this.jobBudgetUsd * parseFloat(this.assets[i].free) / this.assets[i].busdValue; // how much we need
            this.assets[i].allowance = allowance;


            if (this.assets[i].token == 'BNB') { // BNB doesn't need to be approved
              this.assets[i].isApproved = true;
            } else {
              
              // verify current allowance
              let currentAllowance = await this.bscService.getEscrowAllowance(this.assets[i].token);
              console.log(this.assets[i].token + ' currentAllowance ' + currentAllowance + ', needed ' +allowance);
              this.assets[i].currentAllowance = currentAllowance;
              
              if (currentAllowance >= allowance) this.assets[i].isApproved = true;
              
            }
            
          }
          
        } else {
          this.assets[i].freeUsd = 'na';          
        }
        this.assets[i].converting = false;
      }
      
    }
    
  }

  async estimateGasApprove() {
    for (let i=0; i<this.assets.length; i++) {
      if (this.assets[i].token == 'BNB') { // BNB doesn't need to be approved
        if (this.assets[i].hasEnough) this.assets[i].isApproved = true;
      } else {
        if (this.assets[i].hasEnough && (this.assets[i].gasApprove == '') && !this.assets[i].isApproved) {
          // estimate only if not approved
          let gasApprove = await this.bscService.estimateGasApprove(this.assets[i].token, this.assets[i].allowance);
          if (parseFloat(gasApprove) >= 0) this.assets[i].gasApprove = `~${parseFloat(gasApprove).toFixed(4)}`;
        }
      }
    }
  }
  
  async estimateGasDeposit() {
    // estimate silently for all, if it succeeds, it means asset is already approved
    for (let i=0; i<this.assets.length; i++) {
      if (this.assets[i].hasEnough && (this.assets[i].gasDeposit == '') && this.assets[i].isApproved) {
        // estimate only if approved
        
        let estimateResult = await this.bscService.estimateGasDeposit(this.assets[i].token, this.providerAddress, this.assets[i].allowance, this.jobId, true);
        //let estimateResult = await this.bscService.estimateGasDeposit(this.assets[i].token, this.providerAddress, allowance, this.jobId, false); // debug false
        if (parseFloat(estimateResult.gasDeposit) >= 0) {
          this.assets[i].gasDeposit = `~${parseFloat(estimateResult.gasDeposit).toFixed(4)}<br>${estimateResult.pathAssets.join("->")}`;
        }
        
      }
    }
  }

  async approve(asset) {
    if (!asset.converting && asset.hasEnough && !asset.isApproved) {
      console.log('Needed allowance: '+asset.allowance);
      // we have to ask allowance increase, so it's better to add 10% already to handle market fluctuations if trying payment more times
      const safetyAllowance = asset.allowance * 1.1;
      
      console.log('Safety allowance (+10%): '+safetyAllowance);
      
      let result = await this.bscService.approve(asset.token, safetyAllowance);
      // check result and approve into controller state
      if (!result.err) {
        asset.isApproved = true;
        // estimateGasDeposit after approval
        let estimateResult = await this.bscService.estimateGasDeposit(asset.token, this.providerAddress, asset.allowance, this.jobId, false);
        if (parseFloat(estimateResult.gasDeposit) >= 0) asset.gasDeposit = `~${parseFloat(estimateResult.gasDeposit).toFixed(4)}<br>${estimateResult.pathAssets.join("->")}`; 
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
