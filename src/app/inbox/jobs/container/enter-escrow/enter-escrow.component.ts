import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  CanPay, CanPayData, Operation, PaymentItem, PaymentItemCurrency, PaymentSummary,
  setProcessResult
} from '@canpay-lib/lib';
import { Job } from '@class/job';
import { ActionType, IJobAction } from '@class/job-action';
import { User, UserType } from '@class/user';
import { CanWorkJobContract } from '@contract/can-work-job.contract';
import { EthService } from '@service/eth.service';
import { FeatureToggleService } from '@service/feature-toggle.service';
import { LimepayService } from '@service/limepay.service';
import { JobService } from '@service/job.service';
import { MomentService } from '@service/moment.service';
import { Transaction, TransactionService } from '@service/transaction.service';
import { UserService } from '@service/user.service';
import { GenerateGuid } from '@util/generate.uid';
import 'rxjs/add/operator/take';
import { Subscription } from 'rxjs/Subscription';
import { map, take } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';

import { environment } from '@env/environment';

@Component({
  selector: 'app-enter-escrow',
  templateUrl: './enter-escrow.component.html',
  styleUrls: ['./enter-escrow.component.css']
})
export class EnterEscrowComponent implements OnInit {

  job: Job;
  totalJobBudgetUsd: number;

  paymentMethod: string;

  canPayOptions: CanPay;
  canexDisabled = false;

  walletForm: FormGroup = null;
  createWalletStep = 0;

  hasWallet = false;
  limepayWallet: any;
  loading = true;

  constructor(private ethService: EthService,
    private afs: AngularFirestore,
    private formBuilder: FormBuilder,
    private jobService: JobService,
    private userService: UserService,
    private limepayService: LimepayService,
    private transactionService: TransactionService,
    private featureService: FeatureToggleService,
    private activatedRoute: ActivatedRoute,
    private momentService: MomentService,
    private router: Router) {
    this.walletForm = this.formBuilder.group({
      password: ['', Validators.compose([Validators.required])]
    });
  }

  ngOnInit() {
    const jobId = this.activatedRoute.parent.snapshot.params['id'] || null;
    if (jobId) {
      this.jobService.getJob(jobId).take(1).subscribe(async (job: Job) => {
        this.totalJobBudgetUsd = await this.jobService.getJobBudgetUsd(job);
        this.job = job;
        this.loading = false;
      });
    }
  }

  async setPaymentMethod(type: string) {
    if (type === 'fiat') {
      this.paymentMethod = 'fiat';
      this.loading = true;
      try {
        const shopper = await this.limepayService.getShopper();
        this.hasWallet = !!shopper.walletAddress;
        if (!this.hasWallet) {
          this.createWalletStep = 1;
        } else {
          this.limepayWallet = await this.limepayService.getWallet();
          this.createWalletStep = 2;
        }
      } catch (e) {
        this.error = true;
      }
    } else if (type === 'crypto') {
      this.paymentMethod = 'crypto';
    } else {
      this.paymentMethod = null;
    }
  }


  async getWallet() {
    this.limepayService.getWallet().then((wallet) => {
      console.log(wallet);
    }).catch(e => {
      console.log(e);
    });
  }

  async initialiseFiatPayment() {
    const provider = await this.userService.getUser(this.job.providerId);
    const token = this.limepayService.initFiatPayment(this.job.id, provider.ethAddress);
    // Unlocks the payment form
    fiatPayment = await this.limepayService.library.FiatPayments.load(token);
}

  // The function is trigger once the user submits the payment form
  async processFiatPayment() {

    // Get the shopper JSON wallet

    // const transactions = await this.limepayService.getEnterEscrowTransactions(this.job.id);

    // Signs the provided transactions using the Shoppers wallet
    // const signedTXs = await limepay.Transactions.signWithEncryptedWallet(transactions, JSON.stringify(shopperWallet), SHOPPER_WALLET_PASSPHRASE);

    // // Extracting the Card holder information from the form
    // const cardHolderInformation = {
    //     vatNumber: document.getElementById('vat-number').value,
    //     name: document.getElementById('card-holder-name').value,
    //     countryCode: document.getElementById('countries-codes').value,
    //     zip: document.getElementById('zip-code').value,
    //     street: document.getElementById('street-address').value
    // };

    // if (document.getElementById('company').checked) {
    //     cardHolderInformation.isCompany = true;
    // } else if (document.getElementById('personal').checked) {
    //     cardHolderInformation.isCompany = false;
    // }

    // // Triggers the processing of the payment
    // fiatPayment.process(cardHolderInformation, signedTXs)
    //     .then(res => {
    //         alert("done!");
    //     });
}

  async createWallet() {
    console.log('Creating Wallet');
    const shopper = this.userService.getUser(this.job.clientId);
    this.createWalletStep = 2;
    this.limepayService.createShopper(this.job.clientId);
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
      this.transactionService.startMonitoring(this.job, from, txId, txHash, ActionType.authoriseEscrow);
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

    const onTxHash = async (txHash: string, from: string) => {
      /* IF enter escrow hash gets sent, do:
         post tx to transaction monitor
         save tx to collection
         save action/pending to job */
      const txId = GenerateGuid();
      this.transactionService.startMonitoring(this.job, from, txId, txHash, ActionType.enterEscrow);
      this.transactionService.saveTransaction(new Transaction(txId, this.job.clientId,
        txHash, this.momentService.get(), ActionType.enterEscrow, this.job.id));
      const action = new IJobAction(ActionType.enterEscrow, UserType.client);
      this.job.actionLog.push(action);
      this.job.clientEthAddress = from;
      clientEthAddress = from;
      await this.jobService.saveJobFirebase(this.job);
    };

    const initiateEnterEscrow = async (canPayData: CanPayData) => {
      const provider = await this.userService.getUser(this.job.providerId);
      const canWorkContract = new CanWorkJobContract(this.ethService);
      canWorkContract.connect().createJob(this.job, clientEthAddress || this.ethService.getOwnerAccount(), provider.ethAddress, onTxHash)
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
      cancel: onComplete,
      disableCanEx: this.canexDisabled,
      userEmail: client.email,

      // Post Authorisation
      postAuthorisationProcessName: 'Job creation',
      startPostAuthorisationProcess: initiateEnterEscrow.bind(this),
      postAuthorisationProcessResults: null
    };
  }

}
