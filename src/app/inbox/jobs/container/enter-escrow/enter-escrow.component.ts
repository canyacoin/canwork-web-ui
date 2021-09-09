import { Component, OnInit, AfterViewInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { CanPay, bepAssetData } from '@canpay-lib/lib'
import { Job, JobState } from '@class/job'
import { ActionType, IJobAction } from '@class/job-action'
import { UserType } from '@class/user'
import { ToastrService } from 'ngx-toastr'
import 'rxjs/add/operator/take'
import { Observable } from 'rxjs/Observable'
import { HttpClient } from '@angular/common/http'

import { JobService } from '@service/job.service'
import { UserService } from '@service/user.service'
import { BinanceService } from '@service/binance.service'

@Component({
  selector: 'app-enter-escrow',
  templateUrl: './enter-escrow.component.html',
  styleUrls: ['./enter-escrow.component.css'],
})
export class EnterEscrowComponent implements OnInit, AfterViewInit {
  loading = true

  jobStateCheck = false
  walletConnected = false
  paymentMethod: string | boolean = false
  showAssetSelection = false
  bepAssetData: bepAssetData
  assetDataHandler: any

  error
  job: Job
  errorMsg: string
  jobBudgetUsd: number
  canPayOptions: CanPay
  countryList: any

  constructor(
    private jobService: JobService,
    private userService: UserService,
    private binanceService: BinanceService,
    private toastr: ToastrService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

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
          this.checkWalletConnection()
          this.startBepAssetSelector();
        })
    }
  }

  ngAfterViewInit() {
    this.getJSON().subscribe(data => {
      const result = Object.keys(data).map(function(key) {
        return [key, data[key]]
      })
      this.countryList = result
    })
  }

  lookupCountryCode(countryName: string) {
    for (let i = 0; i < this.countryList.length; i++) {
      // This if statement depends on the format of your array
      if (this.countryList[i][1] === countryName) {
        return this.countryList[i][0] // Found it
      }
    }
    return null // Not found
  }

  public getJSON(): Observable<any> {
    return this.http.get('../../assets/js/countryCodes.json')
  }

  async checkWalletConnection() {
    if (
      !this.binanceService.isLedgerConnected() &&
      !this.binanceService.isKeystoreConnected() &&
      !this.binanceService.isWalletConnectConnected()
    ) {
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
    const address = this.binanceService.getAddress() // temporary
    console.log('Connected to wallet: ' + address) // temporary
  }

  startBepAssetSelector() {
    // Initiates the bepAssetSelector template
    if (this.jobStateCheck && this.walletConnected) {
      this.showAssetSelection = true
    }

    const onSelection = async assetData => {
      this.showAssetSelection = false // Destroys the bepAssetSelector
      this.bepAssetData = assetData // Receives the selected asset data
      this.paymentMethod = this.bepAssetData.symbol // Initiates the Canpay Wizard
      this.startCanpay()
    }
    this.assetDataHandler = {
      // passed back from bepAssetSelector
      asset: onSelection,
    }
  }

  startBscAssetSelector() {
    if (this.jobStateCheck && this.walletConnected) {
      this.showBscAssetSelection = true
    }
    
  }



  async startCanpay() {
    console.log('START CAN PAY')
    const onComplete = async () => {
      // call endpoint?
      this.router.navigate(['/inbox/job', this.job.id])
    }

    const onBackFromSummary = async () => {
      this.router
        .navigateByUrl('/inbox/job/' + this.job.id, {
          skipLocationChange: true,
        })
        .then(() =>
          this.router.navigate(['/inbox/job/' + this.job.id + '/enter-escrow'])
        )
    }

    const startJob = async () => {
      const action = new IJobAction(ActionType.enterEscrow, UserType.client)
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
    const jobBudgetAsset = this.jobBudgetUsd / this.bepAssetData.usdPrice
    const jobBudgetAtomic = Math.ceil(jobBudgetAsset * 1e8)

    const paymentSummary = {
      asset: this.bepAssetData,
      job: {
        name: this.job.information.title,
        usdValue: this.jobBudgetUsd,
        jobId: this.job.id,
        providerAddress: provider.bnbAddress,
      },
      jobBudgetAtomic: jobBudgetAtomic,
    }

    const initialisePayment = (
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
    }

    this.canPayOptions = {
      successText: 'Escrow success, job started!',
      paymentSummary: paymentSummary,
      complete: onComplete,
      cancel: onBackFromSummary,
      initialisePayment,
    }
  }
}
