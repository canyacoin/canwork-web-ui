import { Component, OnInit, AfterViewInit, Directive } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Job, JobState } from '@class/job'
import { ActionType, IJobAction } from '@class/job-action'
import { UserType } from '@class/user'
import 'rxjs/add/operator/take'
import { Observable } from 'rxjs/Observable'
import { HttpClient } from '@angular/common/http'

import { JobService } from '@service/job.service'
import { UserService } from '@service/user.service'
import { BscService, BepChain } from '@service/bsc.service'
import { TransactionService } from '@service/transaction.service'

import { NgxSpinnerService } from 'ngx-spinner'
import { providerTypeArray } from 'app/shared/constants/providerTypes'
import { formatDateFromString } from 'app/core-functions/date'
import { MessageService } from 'primeng/api'

@Component({
  selector: 'app-enter-escrow-bsc',
  templateUrl: './enter-escrow-bsc.component.html',
})
export class EnterEscrowBscComponent implements OnInit {
  loading = true
  jobStateCheck = false
  walletConnected = false
  showBscAssetSelection = false
  jobBudgetUsd: number
  jobTitle: string = 'Job Title' // default
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
  providerAddress: string
  noProviderAddress: boolean = false
  isApproved = false
  approvalNeeded = true
  isApproving = false
  balanceIssue = false

  formatDateFromString = formatDateFromString

  visibleActionDialogModal = false

  constructor(
    private jobService: JobService,
    private userService: UserService,
    private bscService: BscService,
    private transactionService: TransactionService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private spinner: NgxSpinnerService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.spinner.show()
    const jobId = this.activatedRoute.parent.snapshot.params['id'] || null
    if (jobId) {
      console.log('Job ID: ' + jobId)
      this.jobService
        .getJob(jobId)
        .take(1)
        .subscribe(async (job: Job) => {
          this.jobBudgetUsd = await this.jobService.getJobBudgetUsd(job)
          this.job = job
          if (this.job && this.job.information && this.job.information.title)
            this.jobTitle = this.job.information.title
          if (this.job.state !== JobState.termsAcceptedAwaitingEscrow) {
            this.jobStateCheck = false
          } else {
            this.jobStateCheck = true
            console.log('this.jobStateCheck: ', this.jobStateCheck)
            const provider = await this.userService.getUser(this.job.providerId)
            this.providerAddress = provider.bscAddress
            console.log('this.providerAddress: ', this.providerAddress)
            if (!this.providerAddress) {
              this.noProviderAddress = true
              this.jobStateCheck = false // we can't go on if provider hasn't bscAddress
            }
          }

          this.loading = false
          const chain = await this.checkWalletConnection()
          console.log('chain:', chain)
          if (chain == BepChain.SmartChain) this.startBscAssetSelector()
        })
    }
    this.spinner.hide()
  }

  startBscAssetSelector() {
    if (this.jobStateCheck && this.walletConnected) {
      this.showBscAssetSelection = true
    }
    console.log('this.showBscAssetSelection:', this.showBscAssetSelection)

    const onSelection = async (assetData) => {
      // keep this context
      this.showBscAssetSelection = false // Destroys the bscAssetSelector
      this.bscAssetData = assetData // Receives the selected asset data
      this.paymentMethod = this.bscAssetData.symbol
      // Initiates the Canpay Wizard
      await this.startBscPay()
    }
    this.assetDataHandler = {
      // passed back from bscAssetSelector
      asset: onSelection,
    }
  }

  async startBscPay() {
    this.spinner.show()
    this.isEscrowLoading = true

    const onComplete = async () => {
      this.router.navigate(['/inbox/job', this.job.id])
    }

    let allowance = parseFloat(
      await this.bscService.getTokenAmount(
        this.jobBudgetUsd,
        this.bscAssetData.token
      )
    )
    console.log(allowance)

    let paymentSummary = {
      asset: this.bscAssetData,
      assetValue:
        this.bscAssetData.usdtValue / parseFloat(this.bscAssetData.free),
      job: {
        name: this.job.information.title,
        usdValue: this.jobBudgetUsd,
        jobId: this.job.id,
        providerAddress: this.providerAddress,
      },
      allowance,
    }

    this.bscPayOptions = {
      successText: 'Escrow success, job started!',
      paymentSummary: paymentSummary,
      complete: onComplete,
    }

    // get updated availble balance
    let balance
    if (this.bscAssetData.token == 'BNB') {
      balance = {
        address: '',
        name: 'BNB',
        symbol: 'BNB',
        err: '',
        free: await this.bscService.getBnbBalance(),
      }
      if (balance.free == -1) balance.err = 'Invalid BNB balance'
    } else balance = await this.bscService.getBalance(this.bscAssetData.token)
    console.log(balance)

    if (!balance.err) {
      this.bscPayOptions.paymentSummary.balance = balance
      this.showBalance = true // enable balance show
      if (allowance > parseFloat(balance.free)) {
        this.depositError = 'Insufficient amount available'
        this.balanceIssue = true
      } else {
        // we have enough, now check contract allowance if not bnb
        if (this.bscAssetData.token == 'BNB') {
          this.approvalNeeded = false
          this.isApproved = true
        } else {
          this.approvalNeeded = true
          this.isApproved = false

          // check allowance
          let currentAllowance = await this.bscService.getEscrowAllowance(
            this.bscAssetData.token
          )
          console.log(
            this.bscAssetData.token +
              ' currentAllowance ' +
              currentAllowance +
              ', needed ' +
              allowance
          )

          // current allowance is returned as stringified bignumber if it returns correctly
          if (
            typeof currentAllowance === 'string' &&
            parseFloat(currentAllowance) >= allowance
          ) {
            this.isApproved = true
          }
        }
      }
    } else {
      this.depositError = 'Error calculating available balance'
      this.balanceIssue = true
    }

    console.log(this.bscPayOptions)
    this.isEscrowLoading = false
    this.spinner.hide()
  }

  async approveAsset() {
    if (this.isApproving) return // avoid double click

    this.isApproving = true
    console.log(
      'Needed allowance: ' + this.bscPayOptions.paymentSummary.allowance
    )

    // we have to ask allowance increase, so it's better to add 10% already to handle market fluctuations if trying payment more times
    const safetyAllowance = this.bscPayOptions.paymentSummary.allowance * 1.1

    console.log('Safety allowance (+10%): ' + safetyAllowance)

    let result = await this.bscService.approve(
      this.bscAssetData.token,
      safetyAllowance
    )
    // check result and approve into controller state
    if (!result.err) {
      this.isApproved = true
      // save tx
      let tx = await this.transactionService.createTransaction(
        `Approve ${this.bscAssetData.token}`,
        result.transactionHash,
        this.job.id
      )
    }

    this.isApproving = false
  }

  async finalizeBscPay() {
    if (this.isEscrowLoading) return // avoid double click

    this.depositError = false // reset errors
    this.isEscrowLoading = true
    console.log('Deposit ' + this.bscPayOptions.paymentSummary.allowance)
    // now finally actually try to deposit
    let result = await this.bscService.deposit(
      this.bscAssetData.token,
      this.providerAddress,
      this.bscPayOptions.paymentSummary.allowance,
      this.job.id,
      this.jobTitle,
      this.job.providerId
    )

    // throw ('debug error'); // simulate the user close the browser
    /*
    backend will have to:
    - create jobs tx
    - send email and chat notifications (tbd step 2 todo optional, is it required)
    - update state
    */

    // check result and approve into controller state
    if (!result.err) {
      /*
      // moved to backend
      // for deposit bep20 it will be handled from backend
      // save tx immediately
      let tx = await this.transactionService.createTransaction(
        `Deposit ${this.bscAssetData.token}`,
        result.transactionHash,
        this.job.id
      );
      
      */

      const action = new IJobAction(ActionType.enterEscrowBsc, UserType.client)
      this.job.state = JobState.inEscrow

      let success = await this.jobService.handleJobAction(this.job, action)

      if (success) {
        this.showSuccess = true
        this.visibleActionDialogModal = true
        this.showBalance = false // not needed anymore and it will change
        this.isEscrowLoading = false // done
      } else {
        this.depositError =
          'Error starting job, escrow succesful, please contact CanWork support'
        // do not unblock form
      }
    } else {
      this.isEscrowLoading = false // done
      this.depositError = result.err
    }
  }

  async checkWalletConnection() {
    let connectedChain = undefined
    // BEP20 has the priority, if it's connected will use it
    if (await this.bscService.isBscConnected())
      connectedChain = BepChain.SmartChain
    if (!connectedChain) {
      const routerStateSnapshot = this.router.routerState.snapshot
      this.messageService.add({
        severity: 'warn',
        summary: 'Warn',
        detail: `Connect your wallet to use this payment method`,
      })
      this.router.navigate(['/wallet-bnb/assets'], {
        queryParams: { returnUrl: routerStateSnapshot.url },
      })
      return
    }
    this.walletConnected = true
    const address = this.bscService.getAddress() // temporary
    console.log('Connected to BEP20 wallet: ' + address) // temporary
    return connectedChain
  }

  getProviderImage(id: string) {
    const category = providerTypeArray.find((prov) => prov.id === id)
    return category.iconSrc
  }

  getProviderTitle(id: string) {
    const category = providerTypeArray.find((prov) => prov.id === id)
    return category.title
  }

  backToJob(event: Event) {
    event.preventDefault()
    this.router.navigate(['/inbox/job', this.job.id])
  }

  cancelDialog(event: Event) {
    event.preventDefault()
    this.visibleActionDialogModal = false
  }
}
