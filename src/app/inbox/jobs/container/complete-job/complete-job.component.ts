import { Payment } from './../../../../core-classes/job';
import { LimepayService } from './../../../../core-services/limepay.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CanPay, CanPayData, Operation, PaymentItem, PaymentItemCurrency, PaymentSummary,
  setProcessResult
} from '@canpay-lib/lib';
import { Job, JobState } from '@class/job';
import { ActionType, IJobAction } from '@class/job-action';
import { User, UserType } from '@class/user';
import { CanWorkJobContract } from '@contract/can-work-job.contract';
import { EthService } from '@service/eth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FeatureToggleService } from '@service/feature-toggle.service';
import { JobService } from '@service/job.service';
import { MomentService } from '@service/moment.service';
import { Transaction, TransactionService } from '@service/transaction.service';
import { GenerateGuid } from '@util/generate.uid';
import 'rxjs/add/operator/take';
import { Subscription } from 'rxjs/Subscription';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-complete-job',
  templateUrl: './complete-job.component.html',
  styleUrls: ['./complete-job.component.css']
})
export class CompleteJobComponent implements OnInit {

  job: Job;
  walletForm: FormGroup;
  canPayOptions: CanPay;
  errorMsg: any;
  fiatPayment: boolean;
  processing = false;
  processed = false;
  success = false;
  constructor(private ethService: EthService,
    private jobService: JobService,
    private transactionService: TransactionService,
    private featureService: FeatureToggleService,
    private activatedRoute: ActivatedRoute,
    private momentService: MomentService,
    private router: Router,
    private limepay: LimepayService,
    private formBuilder: FormBuilder) {

    this.walletForm = this.formBuilder.group({
      password: ['', Validators.compose([Validators.required])]
    });
  }

  ngOnInit() {
    const jobId = this.activatedRoute.parent.snapshot.params['id'] || null;
    if (jobId) {
      this.jobService.getJob(jobId).take(1).subscribe(async (job: Job) => {
        this.job = job;
        if (this.job.fiatPayment === undefined || this.job.fiatPayment === false) {
          this.fiatPayment = false;
          this.startCanpay();
        } else {
          this.fiatPayment = true;
        }
      });
    }
  }

  async finishJob() {
    this.processing = true;
    try {
      const payment = await this.limepay.initRelayedPayment(this.job.id, this.job.clientId);
      this.processing = false;
      this.processed = true;
      console.log(payment);

      // Load the payment from LimePay
      const relayedPayment = await this.limepay.library.RelayedPayments.load(payment.paymentToken);

      // Sign the transactions
      // TODO The wallet password is hardcoded.. Should be retrieved from the client
      const signedTransactions = await this.limepay.library.Transactions.signWithLimePayWallet(payment.transactions, payment.paymentToken, this.walletForm.value.password);
      console.log(signedTransactions);

      // Trigger the processing of the payment
      await relayedPayment.process(signedTransactions);
      this.success = true;
      // Trigger the monitoring of the payment
      await this.limepay.monitorPayment(payment.paymentId, this.job.id);

    } catch (e) {
      alert('Something went wrong...');
      this.processing = false;
      this.success = false;
      console.log(e);
      this.errorMsg = e;
    }
  }
  async startCanpay() {
    const onTxHash = async (txHash: string, from: string) => {
      /* IF complete job hash gets sent, do:
        post tx to transaction monitor
        save tx to collection
        save action/pending to job */
      const txId = GenerateGuid();
      this.job.state = JobState.finishingJob;
      this.transactionService.startMonitoring(this.job, from, txId, txHash, ActionType.acceptFinish);
      this.transactionService.saveTransaction(new Transaction(txId, this.job.clientId,
        txHash, this.momentService.get(), ActionType.acceptFinish, this.job.id));
      this.job.actionLog.push(new IJobAction(ActionType.acceptFinish, UserType.client));
      await this.jobService.saveJobFirebase(this.job);
    };

    const initiateCompleteJob = async (canPayData: CanPayData) => {
      const canWorkContract = new CanWorkJobContract(this.ethService);
      canWorkContract.connect().completeJob(this.job, this.job.clientEthAddress || this.ethService.getOwnerAccount(), onTxHash)
        .then(setProcessResult.bind(this.canPayOptions))
        .catch(setProcessResult.bind(this.canPayOptions));
    };

    const onComplete = async (result) => {
      // call endpoint?
      this.router.navigate(['/inbox/job', this.job.id]);
    };

    const onCancel = () => {
      // call endpoint?
      this.router.navigate(['/inbox/job', this.job.id]);
    };

    this.canPayOptions = {
      dAppName: `CanWork`,
      successText: 'Woohoo, job complete!',
      recipient: environment.contracts.canwork,
      operation: Operation.interact,
      complete: onComplete,
      cancel: onCancel,
      postAuthorisationProcessName: 'Job completion',
      startPostAuthorisationProcess: initiateCompleteJob.bind(this),
      postAuthorisationProcessResults: null
    };
  }
}
