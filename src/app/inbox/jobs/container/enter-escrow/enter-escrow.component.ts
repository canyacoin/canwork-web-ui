import { Component, OnInit, AfterViewInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import {
  CanPay,
  Operation,
  PaymentItemCurrency,
  BepAssetPaymentData,
} from '@canpay-lib/lib'
import { Job, JobState } from '@class/job'
import { ActionType, IJobAction } from '@class/job-action'
import { UserType } from '@class/user'
import { FeatureToggleService } from '@service/feature-toggle.service'
import { JobService } from '@service/job.service'
import { UserService } from '@service/user.service'
import { BinanceService } from '@service/binance.service'
import { ToastrService } from 'ngx-toastr'
import 'rxjs/add/operator/take'
import { Observable } from 'rxjs/Observable'
import { HttpClient } from '@angular/common/http'

import { environment } from '@env/environment'
import { roundAtomicCanTwoDecimals } from '@util/currency-conversion'

@Component({
  selector: 'app-enter-escrow',
  templateUrl: './enter-escrow.component.html',
  styleUrls: ['./enter-escrow.component.css'],
})
export class EnterEscrowComponent implements OnInit, AfterViewInit {
  loading = true
  paying = false
  wrongPassword = false
  paymentId: any

  jobStateCheck = false
  walletConnected = false
  paymentMethod: string | boolean = false
  showAssetSelection = false
  bepAssetPaymentData: BepAssetPaymentData
  assetDataHandler: any

  error
  job: Job
  errorMsg: string
  totalJobBudgetUsd: number
  canPayOptions: CanPay
  countryList: any

  shopper: any
  transactions: any
  signedTransactions: any
  paymentToken: any

  constructor(
    private formBuilder: FormBuilder,
    private jobService: JobService,
    private userService: UserService,
    private binanceService: BinanceService,
    private toastr: ToastrService,
    private featureService: FeatureToggleService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const jobId = this.activatedRoute.parent.snapshot.params['id'] || null
    console.log('ENTER ESCROW')
    if (jobId) {
      console.log('Job ID: ' + jobId)
      this.jobService
        .getJob(jobId)
        .take(1)
        .subscribe(async (job: Job) => {
          this.totalJobBudgetUsd = await this.jobService.getJobBudgetUsd(job)
          this.job = job
          if (this.job.state !== JobState.termsAcceptedAwaitingEscrow) {
            this.jobStateCheck = false
          } else {
            this.jobStateCheck = true
          }
          console.log('Job State: ' + this.job.state)
          console.log('Job State Check Passed: ' + this.jobStateCheck)
          this.loading = false
          this.checkWalletConnection()
          this.startBepAssetSelector()
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
    console.log('CHECKING WALLET CONNECTION...')
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
    console.log('Connected to: ' + address) // temporary
  }

  startBepAssetSelector() {
    if (this.jobStateCheck && this.walletConnected) {
      this.showAssetSelection = true
    }

    const onSelection = async assetData => {
      this.showAssetSelection = false
      this.bepAssetPaymentData = assetData
      console.log(this.bepAssetPaymentData.symbol + ' selected')
      console.log(this.bepAssetPaymentData)

      this.paymentMethod = this.bepAssetPaymentData.symbol
      this.startCanpay()
    }

    this.assetDataHandler = {
      asset: onSelection,
    }
  }

  async startCanpay() {
    console.log('START CAN PAY')
    const onComplete = async () => {
      // call endpoint?
      this.router.navigate(['/inbox/job', this.job.id])
    }

    const startJob = async () => {
      const action = new IJobAction(ActionType.enterEscrow, UserType.client)
      this.job.actionLog.push(action)
      this.job.state = JobState.inEscrow
      await this.jobService.saveJobFirebase(this.job)
      console.log('Start Job: ' + this.job)
    }

    const provider = await this.userService.getUser(this.job.providerId)

    const initiateEnterEscrow = async () => {
      // TODO remove initiateEnterEscrow
    }

    const client = await this.userService.getUser(this.job.clientId)

    const paymentSummary = {
      currency: PaymentItemCurrency.usd,
      items: [
        {
          name: this.job.information.title,
          value: this.totalJobBudgetUsd,
          jobId: this.job.id,
          providerAddress: provider.bnbAddress,
        },
      ],
      total: this.totalJobBudgetUsd,
    }
    console.log('Payment Summary: ')
    console.log(paymentSummary)

    // use 101% to decrase chances of underpayment and round to 2 decimals
    const jobBudgetCan = roundAtomicCanTwoDecimals(
      Math.round((await this.jobService.getJobBudgetBinance(this.job)) * 1.01)
    )

    const initialisePayment = (
      beforeCallback,
      successCallback,
      failureCallback
    ) => {
      console.log('initialise Payment')
      const paymentItem = paymentSummary.items[0]
      const { jobId, providerAddress } = paymentItem

      const onSuccess = () => {
        startJob()
        if (successCallback) {
          successCallback()
        }
      }

      this.binanceService.escrowFunds(
        jobId,
        jobBudgetCan,
        providerAddress,
        beforeCallback,
        onSuccess,
        failureCallback
      )
    }

    this.canPayOptions = {
      successText: 'Woohoo, job started!',
      operation: Operation.auth,

      amount: jobBudgetCan,
      paymentSummary: paymentSummary,
      complete: onComplete,
      cancel: onComplete,

      userEmail: client.email,
      initialisePayment,

      startJob,
    }
  }
}
