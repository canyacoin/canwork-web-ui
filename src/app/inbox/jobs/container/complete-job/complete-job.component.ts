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

  canPayOptions: CanPay;


  constructor(private ethService: EthService,
    private jobService: JobService,
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
        this.job = job;
        this.startCanpay();
      });
    }
  }

  async startCanpay() {

    const onTxHash = async (txHash: string, from: string) => {
      /* IF complete job hash gets sent, do:
         post tx to transaction monitor
         save tx to collection
         save action/pending to job */
      const txId = GenerateGuid();
      this.transactionService.startMonitoring(this.job, from, txId, txHash, ActionType.acceptFinish)
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
