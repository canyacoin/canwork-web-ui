import { Component, OnInit, AfterViewInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Job, JobState } from '@class/job'
import { ActionType, IJobAction } from '@class/job-action'
import { UserType } from '@class/user'
import { ToastrService } from 'ngx-toastr'
import 'rxjs/add/operator/take'
import { Observable } from 'rxjs/Observable'
import { HttpClient } from '@angular/common/http'

import { JobService } from '@service/job.service'
import { UserService } from '@service/user.service'
import { BscService, BepChain } from '@service/bsc.service'

@Component({
  selector: 'app-enter-escrow-bsc',
  templateUrl: './enter-escrow-bsc.component.html',
  styleUrls: ['./enter-escrow-bsc.component.css']
})
export class EnterEscrowBscComponent implements OnInit, AfterViewInit {
  loading = true
  jobStateCheck = false
  walletConnected = false
  showBscAssetSelection = false
  jobBudgetUsd: number
  job: Job
  assetDataHandler: any
  bscAssetData: any
  bscPayOptions: any
  paymentMethod: string | boolean = false
  isEscrowLoading: boolean = false
  chain = BepChain.SmartChain
  showBalance = false
  depositError: string | boolean = false
  showSuccess = false
  
  
  
  

  constructor(
    private jobService: JobService,
    private userService: UserService,
    private bscService: BscService,
    private toastr: ToastrService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private http: HttpClient  
  ) { }

  ngOnInit() {
    const jobId = this.activatedRoute.parent.snapshot.params['id'] || null
    if (jobId) {
      console.log('Job ID: ' + jobId)
      this.jobService
        .getJob(jobId)
        .take(1)
        .subscribe(async (job: Job) => {
          this.jobBudgetUsd = await this.jobService.getJobBudgetUsd(job)
          this.job = job
          if (this.job.state !== JobState.termsAcceptedAwaitingEscrow) {
            this.jobStateCheck = false
          } else {
            this.jobStateCheck = true
          }

          this.loading = false
          const chain = await this.checkWalletConnection()
          if (chain == BepChain.SmartChain) this.startBscAssetSelector();
        })
    }    
  }
  
  startBscAssetSelector() {
    if (this.jobStateCheck && this.walletConnected) {
      this.showBscAssetSelection = true
    }
    
    const onSelection = async assetData => { // keep this context
      this.showBscAssetSelection = false // Destroys the bscAssetSelector
      this.bscAssetData = assetData // Receives the selected asset data
      this.paymentMethod = this.bscAssetData.symbol 
      // Initiates the Canpay Wizard
      await this.startBscpay()
    }
    this.assetDataHandler = {
      // passed back from bscAssetSelector
      asset: onSelection,
    }    
    
  }
  
  async startBscpay() {

    this.isEscrowLoading = true;
    
    
    const onComplete = async () => {
      this.router.navigate(['/inbox/job', this.job.id])
    }




    const provider = await this.userService.getUser(this.job.providerId)
    const client = await this.userService.getUser(this.job.clientId)

    // Calculate jobBudget in selected BEP asset
    //const jobBudgetAsset = this.jobBudgetUsd / this.bscAssetData.usdPrice
    let allowance = this.jobBudgetUsd / this.bscAssetData.busdValue; // how much we need
    
    //const jobBudgetAtomic = Math.ceil(jobBudgetAsset * 1e8)

    let paymentSummary = {
      asset: this.bscAssetData,
      job: {
        name: this.job.information.title,
        usdValue: this.jobBudgetUsd,
        jobId: this.job.id,
        providerAddress: provider.bscAddress,
      },
      allowance,
    }



    this.bscPayOptions = {
      successText: 'Escrow success, job started!',
      paymentSummary: paymentSummary,
      complete: onComplete,
    }
        
    let balance = await this.bscService.getBalance(this.bscAssetData.token);
    if (!balance.err) {
      this.bscPayOptions.paymentSummary.balance = balance
      this.showBalance = true; // enable balance show

    }
    
    console.log(this.bscPayOptions)
    this.isEscrowLoading = false;

    
  }

  async finalizeBscPay() {
    
    if (this.isEscrowLoading) return; // avoid double click
    
    this.depositError = false // reset errors
    this.isEscrowLoading = true;
    
    // now finally actually try to deposit
    let result = await this.bscService.deposit(this.bscAssetData.token, this.bscPayOptions.paymentSummary.allowance, this.job.id);
    
    // check result and approve into controller state
        
    if (!result.err) {
      const action = new IJobAction(ActionType.enterEscrowBsc, UserType.client)
      this.job.state = JobState.inEscrow

      let success = await this.jobService.handleJobAction(this.job, action)
      if (success) {      
      
         this.showSuccess = true
         this.showBalance = false; // not needed anymore and it will change
         this.isEscrowLoading = false; // done      
      
      } else {
       this.depositError = "Error starting job, escrow succesful, please contact CanWork support" 
       // do not unblock form
      }

    } else {
       this.isEscrowLoading = false; // done
       this.depositError = result.err
       
    }
    

  }

  async checkWalletConnection() {
    let connectedChain = undefined;
    // BEP20 has the priority, if it's connected will use it
    if (this.bscService.isMetamaskConnected()) connectedChain = BepChain.SmartChain;      
    if (!connectedChain) {
      const routerStateSnapshot = this.router.routerState.snapshot
      this.toastr.warning(
        'Connect your wallet to use this payment method',
        '',
        { timeOut: 2000 }
      )
      this.router.navigate(['/wallet-bnb'], {
        queryParams: { returnUrl: routerStateSnapshot.url },
      })
      return
    }
    this.walletConnected = true
    const address = this.bscService.getAddress() // temporary
    console.log('Connected to BEP20 wallet: ' + address) // temporary
    return connectedChain
  }

  ngAfterViewInit() {

  }
  

}
