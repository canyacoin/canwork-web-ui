
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
  walletCreated = 3,
  collectDetails = 4,
  failed = 5,
  complete = 6
}

@Component({
  selector: 'app-enter-escrow',
  templateUrl: './enter-escrow.component.html',
  styleUrls: ['./enter-escrow.component.css']
})
export class EnterEscrowComponent implements OnInit, AfterViewInit {


  loading = true;
  loadingCreditCard = true;
  paying = false;
  wrongPassword = false;
  paymentMethod: string;
  paymentId: any;
  error;
  mnemonic: any;
  job: Job;
  errorMsg: string;
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
      countryCode: ['', Validators.compose([Validators.required])],
      name: ['', Validators.compose([Validators.required])],
      business: [''],
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

  lookupCountryCode(countryName: string) {
    for (let i = 0; i < this.countryList.length; i++) {
      // This if statement depends on the format of your array
      if (this.countryList[i][1] === countryName) {
        return this.countryList[i][0];   // Found it
      }
    }
    return null;   // Not found
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
      const result = await this.limepayService.createWallet(this.walletForm.value.password);
      this.mnemonic = result.mnemonic;
      this.fiatPaymentStep = FiatPaymentSteps.walletCreated;
    } catch (e) {
      this.error = e;
    }
  }

  async unlockWallet() {
    // todo - would be nice to quickly check if password is correct, need to grab wallet and then use ethers to check
    // otherwise, just try and use it by init fiat payment:
    this.initialiseFiatPayment();
  }

  async initialiseFiatPayment() {
    try {
      this.loading = true;
      const { transactions, paymentToken, paymentId } = await this.limepayService.initFiatPayment(this.job.id, this.job.providerId);
      console.log('got the stuff.');
      console.log(transactions, paymentToken, paymentId);
      this.transactions = transactions;
      this.paymentToken = paymentToken;
      this.paymentId = paymentId;
      this.fiatPaymentStep = FiatPaymentSteps.collectDetails;
      this.loading = false;
      this.signedTransactions = await this.limepayService.library.Transactions.signWithLimePayWallet(this.transactions, paymentToken, this.walletForm.value.password);
      const status = await this.limepayService.getPaymentStatus(this.paymentId);
      console.log(status);
      console.log('signed transactions:');
      console.log(this.signedTransactions);
      this.initFiat();
    } catch (e) {
      console.log(e);
      if (e.message === 'invalid password') {
        this.wrongPassword = true;
        this.loading = false;
        this.fiatPaymentStep = FiatPaymentSteps.walletUnlock;
      } else {
        this.error = e;
      }
    }
  }
  async initFiat() {
    this.loadingCreditCard = true;
    this.fiatPayment = await this.limepayService.library.FiatPayments.load(this.paymentToken);
    this.loadingCreditCard = false;
    const iFrameCvv = document.getElementById('bluesnap-hosted-iframe-cvv');
    const iFrameExp = document.getElementById('bluesnap-hosted-iframe-exp');
    const cardLogo = document.getElementById('card-logo');
    iFrameCvv.style.height = '30px';
    iFrameExp.style.height = '30px';
    iFrameCvv.style.border = '1px solid #ebebeb';
    iFrameExp.style.border = '1px solid #ebebeb';
    cardLogo.style.position = 'absolute';
    cardLogo.style.right = '0';
    cardLogo.style.top = '2.5px';
  }
  // The function is trigger once the user submits the payment form
  async processFiatPayment() {
    const cardHolderInformation = {
      name: String(this.cardForm.value.name),
      countryCode: String(this.lookupCountryCode(this.cardForm.value.countryCode)),
      zip: String(this.cardForm.value.zip),
      street: String(this.cardForm.value.street),
      isCompany: false
    };
    this.paying = true;
    try {
      const result = await this.fiatPayment.process(cardHolderInformation, this.signedTransactions);
      console.log(result);
      this.job.fiatPayment = true;
      this.job.clientEthAddress = null;
      await this.jobService.saveJobFirebase(this.job);
      this.fiatPaymentStep = FiatPaymentSteps.complete;

      // Trigger the monitoring of the payment
      await this.limepayService.monitorPayment(this.paymentId, this.job.id);
    } catch (error) {
      this.errorMsg = JSON.stringify(error.message);
      this.fiatPaymentStep = FiatPaymentSteps.failed;
      console.log(error);
    }
    if (this.fiatPaymentStep === FiatPaymentSteps.complete) {
      const status = await this.limepayService.getPaymentStatus(this.paymentId);
      console.log(status);
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
      this.job.fiatPayment = false;
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
