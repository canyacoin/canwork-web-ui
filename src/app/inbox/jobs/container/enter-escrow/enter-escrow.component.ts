import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
    CanPay, CanPayData, EthService, Operation, PaymentItem, PaymentItemCurrency, PaymentSummary,
    setProcessResult
} from '@canyaio/canpay-lib';
import { Job } from '@class/job';
import { ActionType, IJobAction } from '@class/job-action';
import { User, UserType } from '@class/user';
import { CanWorkJobContract } from '@contract/can-work-job.contract';
import { CanWorkEthService } from '@service/eth.service';
import { FeatureToggleService } from '@service/feature-toggle.service';
import { JobService } from '@service/job.service';
import { MomentService } from '@service/moment.service';
import { Transaction, TransactionService } from '@service/transaction.service';
import { UserService } from '@service/user.service';
import { GenerateGuid } from '@util/generate.uid';
import 'rxjs/add/operator/take';
import { Subscription } from 'rxjs/Subscription';

import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-enter-escrow',
  templateUrl: './enter-escrow.component.html',
  styleUrls: ['./enter-escrow.component.css']
})
export class EnterEscrowComponent implements OnInit {

  job: Job;
  totalJobBudgetUsd: number;

  canPayOptions: CanPay;

  canexDisabled = false;

  constructor(private ethService: EthService,
    private jobService: JobService,
    private userService: UserService,
    private transactionService: TransactionService,
    private canworkEthService: CanWorkEthService,
    private featureService: FeatureToggleService,
    private activatedRoute: ActivatedRoute,
    private momentService: MomentService,
    private router: Router) { }

  ngOnInit() {
    const jobId = this.activatedRoute.parent.snapshot.params['id'] || null;
    if (jobId) {
      this.jobService.getJob(jobId).take(1).subscribe(async (job: Job) => {
        this.totalJobBudgetUsd = await this.jobService.getJobBudgetUsd(job);
        this.job = job;
        this.startCanpay();
      });
    }
  }

  async startCanpay() {
    const canexToggle = await this.featureService.getFeatureConfig('canexchange');
    this.canexDisabled = !canexToggle.enabled;

    let clientEthAddress = this.ethService.getOwnerAccount();

    const onAuthTxHash = async (txHash: string, from: string) => {
      /* IF authorisation hash gets sent, do:
         post tx to transaction monitor
         save tx to collection
         save action/pending to job
         update users active eth address */
      const txId = GenerateGuid();
      this.transactionService.startMonitoring(this.job, from, txId, txHash, ActionType.authoriseEscrow)
      this.transactionService.saveTransaction(new Transaction(txId, this.job.clientId,
        txHash, this.momentService.get(), ActionType.authoriseEscrow, this.job.id));
      const escrowAction = new IJobAction(ActionType.authoriseEscrow, UserType.client);
      escrowAction.amountCan = this.job.budgetCan;
      this.job.actionLog.push(escrowAction);
      this.job.clientEthAddress = from;
      clientEthAddress = from;
      await this.jobService.saveJobFirebase(this.job);
    };

    const onComplete = async (result) => {
      // call endpoint?
      this.router.navigate(['/inbox/job', this.job.id]);
    };

    const onCancel = () => {
      // call endpoint?
      this.router.navigate(['/inbox/job', this.job.id]);
    };

    const onTxHash = async (txHash: string, from: string) => {
      /* IF enter escrow hash gets sent, do:
         post tx to transaction monitor
         save tx to collection
         save action/pending to job */
      const txId = GenerateGuid();
      this.transactionService.startMonitoring(this.job, from, txId, txHash, ActionType.enterEscrow)
      this.transactionService.saveTransaction(new Transaction(txId, this.job.clientId,
        txHash, this.momentService.get(), ActionType.enterEscrow, this.job.id));
      const action = new IJobAction(ActionType.enterEscrow, UserType.client)
      this.job.actionLog.push(action);
      this.job.clientEthAddress = from;
      clientEthAddress = from;
      await this.jobService.saveJobFirebase(this.job);
    };

    const initiateEnterEscrow = async (canPayData: CanPayData) => {
      const provider = await this.userService.getUser(this.job.providerId);
      const canWorkContract = new CanWorkJobContract(this.ethService);
      canWorkContract.connect().createJob(this.job, clientEthAddress, provider.ethAddress, onTxHash)
        .then(setProcessResult.bind(this.canPayOptions))
        .catch(setProcessResult.bind(this.canPayOptions));
    };

    const client = await this.userService.getUser(this.job.clientId);

    const paymentSummary = {
      currency: PaymentItemCurrency.usd,
      items: [{ name: this.job.information.title, value: this.totalJobBudgetUsd }],
      total: this.totalJobBudgetUsd
    };

    this.canPayOptions = {
      dAppName: `CanWork`,
      successText: 'Woohoo, job started!',
      recipient: environment.contracts.canwork,
      operation: Operation.auth,
      onAuthTxHash: onAuthTxHash.bind(this),
      amount: this.job.budgetCan,
      paymentSummary: paymentSummary,
      complete: onComplete,
      cancel: onCancel,
      disableCanEx: this.canexDisabled,
      userEmail: client.email,

      // Post Authorisation
      postAuthorisationProcessName: 'Job creation',
      startPostAuthorisationProcess: initiateEnterEscrow.bind(this),
      postAuthorisationProcessResults: null
    };
  }

}
