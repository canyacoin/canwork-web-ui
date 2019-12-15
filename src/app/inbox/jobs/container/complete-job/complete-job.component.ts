import { LimepayService } from './../../../../core-services/limepay.service'
import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import {
  CanPay,
  Operation,
} from '@canpay-lib/lib'
import { Job, JobState } from '@class/job'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { JobService } from '@service/job.service'
import 'rxjs/add/operator/take'
import { environment } from '../../../../../environments/environment'

@Component({
  selector: 'app-complete-job',
  templateUrl: './complete-job.component.html',
  styleUrls: ['./complete-job.component.css'],
})
export class CompleteJobComponent implements OnInit {
  job: Job
  walletForm: FormGroup
  canPayOptions: CanPay
  errorMsg: any
  fiatPayment: boolean
  canSee: boolean
  processing = false
  complete = false
  processed = false
  wrongPassword = false
  success = false
  constructor(
    private jobService: JobService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private limepay: LimepayService,
    private formBuilder: FormBuilder
  ) {
    this.walletForm = this.formBuilder.group({
      password: ['', Validators.compose([Validators.required])],
    })
  }

  ngOnInit() {
    const jobId = this.activatedRoute.parent.snapshot.params['id'] || null
    if (jobId) {
      this.jobService
        .getJob(jobId)
        .take(1)
        .subscribe(async (job: Job) => {
          this.job = job
          if (this.job.state !== JobState.workPendingCompletion) {
            this.canSee = false
          } else {
            this.canSee = true
            if (
              this.job.fiatPayment === undefined ||
              this.job.fiatPayment === false
            ) {
              this.fiatPayment = false
              this.startCanpay()
            } else {
              this.fiatPayment = true
            }
          }
        })
    }
  }

  async finishJob() {
    this.processing = true
    this.wrongPassword = false
    try {
      const payment = await this.limepay.initRelayedPayment(
        this.job.id,
        this.job.clientId
      )

      // Load the payment from LimePay
      const relayedPayment = await this.limepay.library.RelayedPayments.load(
        payment.paymentToken
      )
      // Sign the transactions
      const signedTransactions = await this.limepay.library.Transactions.signWithLimePayWallet(
        payment.transactions,
        payment.paymentToken,
        this.walletForm.value.password
      )
      // Trigger the processing of the payment
      await relayedPayment.process(signedTransactions)
      // Trigger the monitoring of the payment
      await this.limepay.monitorPayment(payment.paymentId, this.job.id)

      this.processing = false
      this.processed = true
      this.success = true
      this.complete = true
    } catch (e) {
      if (e.message === 'invalid password') {
        this.processing = false
        this.success = false
        this.wrongPassword = true
        this.errorMsg = e
      } else {
        this.processing = false
        this.success = false
        this.processed = true
        this.errorMsg = e
      }
    }
  }
  async startCanpay() {
    const initiateCompleteJob = async () => {
      // TODO remove
      console.log('initializeCompleteJob')
      // const canWorkContract = new CanWorkJobContract(this.ethService)
      // canWorkContract
      //   .connect()
      //   .completeJob(
      //     this.job,
      //     this.job.clientEthAddress || this.ethService.getOwnerAccount(),
      //     onTxHash
      //   )
      //   .then(setProcessResult.bind(this.canPayOptions))
      //   .catch(setProcessResult.bind(this.canPayOptions))
    }

    const onComplete = async () => {
      // call endpoint?
      this.router.navigate(['/inbox/job', this.job.id])
    }

    const onCancel = () => {
      // call endpoint?
      this.router.navigate(['/inbox/job', this.job.id])
    }

    this.canPayOptions = {
      dAppName: `CanWork`,
      successText: 'Woohoo, job complete!',
      recipient: environment.contracts.canwork,
      operation: Operation.interact,
      complete: onComplete,
      cancel: onCancel,
      postAuthorisationProcessName: 'Job completion',
      startPostAuthorisationProcess: initiateCompleteJob.bind(this),
      postAuthorisationProcessResults: null,
    }
  }
}
