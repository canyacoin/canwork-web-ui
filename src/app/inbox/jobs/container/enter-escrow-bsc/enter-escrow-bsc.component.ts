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
import { BscService } from '@service/bsc.service'

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
  chain: string
  assetDataHandler: any
  bscAssetData: any
  bscPayOptions: any
  paymentMethod: string | boolean = false
  isEscrowProcessing: boolean = false
  
  
  

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
          if (chain == 'BEP20') this.startBscAssetSelector();
        })
    }    
  }
  
  startBscAssetSelector() {
    if (this.jobStateCheck && this.walletConnected) {
      this.showBscAssetSelection = true
    }
    
    const onSelection = async assetData => { // keep this context
      console.log(assetData)
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
    
    const onComplete = async () => {
      this.router.navigate(['/inbox/job', this.job.id])
    }

    const onBackFromSummary = async () => {
      this.router
        .navigateByUrl('/inbox/job/' + this.job.id, {
          skipLocationChange: true,
        })
        .then(() =>
          this.router.navigate(['/inbox/job/' + this.job.id + '/enter-bsc-escrow'])
        )
    }

    const startJob = async () => {
      // new ActionType enterEscrowBsc
      const action = new IJobAction(ActionType.enterEscrowBsc, UserType.client)
      this.job.state = JobState.inEscrow

      console.log('Start Job: ' + this.job)
      const success = await this.jobService.handleJobAction(this.job, action)
      if (success) {
        console.log('ok')
      }
    }

    const provider = await this.userService.getUser(this.job.providerId)
    const client = await this.userService.getUser(this.job.clientId)

    // Calculate jobBudget in selected BEP asset
    //const jobBudgetAsset = this.jobBudgetUsd / this.bscAssetData.usdPrice
    let allowance = this.jobBudgetUsd / this.bscAssetData.busdValue; // how much we need
    
    //const jobBudgetAtomic = Math.ceil(jobBudgetAsset * 1e8)
    const jobBudgetAtomic = allowance

    const paymentSummary = {
      asset: this.bscAssetData,
      job: {
        name: this.job.information.title,
        usdValue: this.jobBudgetUsd,
        jobId: this.job.id,
        providerAddress: provider.bscAddress,
      },
      jobBudgetAtomic: jobBudgetAtomic,
    }

    /*const initialisePayment = (
      beforeCallback,
      successCallback,
      failureCallback
    ) => {
      console.log('initialise Payment')

      const onSuccess = () => {
        console.log('onSuccess')
        startJob()
        if (successCallback) {
          successCallback()
        }
      }

      this.binanceService.escrowFunds(
        paymentSummary,
        beforeCallback,
        onSuccess,
        failureCallback
      )
    }*/

    this.bscPayOptions = {
      successText: 'Escrow success, job started!',
      paymentSummary: paymentSummary,
      complete: onComplete,
      cancel: onBackFromSummary,
      //initialisePayment,
    }
    
    this.isEscrowProcessing = true;
    // todo invoke deposit function, handle error and success
  }  

  async checkWalletConnection() {
    let connectedChain = '';
    // BEP20 has the priority, if it's connected will use it
    if (this.bscService.isMetamaskConnected()) connectedChain = 'BEP20';      
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
    this.chain = connectedChain
    const address = this.bscService.getAddress() // temporary
    console.log('Connected to BEP20 wallet: ' + address) // temporary
    return connectedChain
  }

  ngAfterViewInit() {

  }
  

}
