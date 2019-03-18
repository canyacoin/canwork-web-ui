import { Component, OnInit, AfterViewInit } from '@angular/core';
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
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';

import { environment } from '@env/environment';

enum FiatPaymentSteps {
  walletInitCreation = 0,
  walletProcessCreation = 1,
  walletUnlock = 2,
  collectDetails = 3,
  processing = 4,
  end = 5
}

@Component({
  selector: 'app-enter-escrow',
  templateUrl: './enter-escrow.component.html',
  styleUrls: ['./enter-escrow.component.css']
})
export class EnterEscrowComponent implements OnInit, AfterViewInit {


  loading = true;
  paymentMethod: string;
  error;

  job: Job;
  totalJobBudgetUsd: number;

  canPayOptions: CanPay;
  canexDisabled = false;
  countryList: any;
  walletForm: FormGroup = null;
  cardForm: FormGroup = null;
  fiatPaymentStep: FiatPaymentSteps;

  shopper: any;
  fiatPayment: any;
  transactions: any;
  signedTransactions: any;
  paymentToken: any;

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
    private router: Router,
    private http: HttpClient) {
    this.walletForm = this.formBuilder.group({
      password: ['', Validators.compose([Validators.required])]
    });
    this.cardForm = this.formBuilder.group({
      cardNumber: ['', Validators.compose([Validators.required])],
      cvv: ['', Validators.compose([Validators.required])],
      countryCode: ['', Validators.compose([Validators.required])],
      name: ['', Validators.compose([Validators.required])],
      expDate: ['', Validators.compose([Validators.required])],
      business: ['', Validators.compose([Validators.required])],
      zip: ['', Validators.compose([Validators.required])],
      street: ['', Validators.compose([Validators.required])]
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

  ngAfterViewInit() {
    this.getJSON().subscribe(data => {
      const result = Object.keys(data).map(function (key) {
        return [key, data[key]];
      });
      this.countryList = result;
    });
  }

  public getJSON(): Observable<any> {
    return this.http.get('../../assets/js/countryCodes.json');
  }

  async setPaymentMethod(type: string) {
    this.paymentMethod = type;
    if (type === 'fiat') {
      try {
        this.loading = true;
        this.shopper = await this.limepayService.getShopper();
        if (!this.shopper) {
          this.shopper = await this.limepayService.createShopper();
        }
        if (!this.shopper.walletAddress) {
          this.fiatPaymentStep = FiatPaymentSteps.walletInitCreation;
        } else {
          this.fiatPaymentStep = FiatPaymentSteps.walletUnlock;
        }
        this.loading = false;
      } catch (e) {
        this.error = e;
        this.loading = false;
      }
    }
  }

  async createWallet() {
    this.fiatPaymentStep = FiatPaymentSteps.walletProcessCreation;
    try {
      await this.limepayService.createWallet(this.walletForm.value.password);
      this.initialiseFiatPayment();
    } catch (e) {
      this.error = e;
    }
  }

  unlockWallet() {
    // todo - would be nice to quickly check if password is correct, need to grab wallet and then use ethers to check
    // otherwise, just try and use it by init fiat payment:

    this.initialiseFiatPayment();
  }

  async initialiseFiatPayment() {
    try {
      this.loading = true;
      const { transactions, paymentToken } = await this.limepayService.initFiatPayment(this.job.id, this.job.providerId);
      console.log('got the stuff.');
      console.log(transactions, paymentToken);
      this.transactions = transactions;
      this.paymentToken = paymentToken;
      const walletToken = await this.limepayService.getWalletToken();
      console.log(this.walletForm);
      this.signedTransactions = await this.limepayService.library.Transactions.signWithLimePayWallet(this.transactions, walletToken, this.walletForm.value.password);
      console.log(this.signedTransactions);
      this.fiatPaymentStep = FiatPaymentSteps.collectDetails;
      this.loading = false;
    } catch (e) {
      console.log(e);
      this.error = e;
      this.loading = false;
    }
  }

  // The function is trigger once the user submits the payment form
  async processFiatPayment() {
    const cardHolderInformation = {
      cardNumber: this.cardForm.value.cardNumber,
      cvv: this.cardForm.value.cvv,
      countryCode: this.cardForm.value.countryCode,
      name: this.cardForm.value.name,
      expDate: this.cardForm.value.expDate,
      isCompany: this.cardForm.value.business,
      street: this.cardForm.value.street
    };
    console.log(cardHolderInformation);
    this.fiatPayment = await this.limepayService.library.FiatPayments.load(this.paymentToken);
    this.fiatPayment.process(cardHolderInformation, this.signedTransactions)
      .then(res => {
        console.log(res);
        alert('done');
      });
    //
    // Extracting the Card hold
    // this.fiatPayment = await this.limepayService.library.FiatPayments.load(this.paymentToken);
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
