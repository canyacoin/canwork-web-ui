import {
    Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation
} from '@angular/core';
import { interval, Subscription } from 'rxjs';

import {
    CanPay, CanPayData, Contract, Operation, PaymentSummary, ProcessAction, ProcessActionResult,
    Step, View
} from '../interfaces';
import { CanYaCoinEthService } from '../services/canyacoin-eth.service';
import { FormDataService } from '../services/formData.service';

@Component({
  selector: 'canyalib-canpay',
  templateUrl: './canpay-wizard.component.html',
  styleUrls: ['./canpay-wizard.component.scss'],
  // encapsulation: ViewEncapsulation.Native
})
export class CanpayWizardComponent implements OnInit, OnDestroy {
  @Output() complete = new EventEmitter();
  @Output() cancel = new EventEmitter();
  @Output() startPostAuthorisationProcess = new EventEmitter();
  @Output() currentStep = new EventEmitter();

  @Input() view = View.Normal;
  @Input() postAuthorisationProcessName;
  @Input() operation = Operation.auth;
  @Input() onAuthTxHash;
  @Input() onPaymentTxHash;
  @Input() recipient;
  @Input() dAppName;
  @Input() successText;
  @Input() amount = 0;
  @Input() paymentSummary: PaymentSummary;
  @Input() minAmount = 1;
  @Input() maxAmount = 0;
  @Input() disableCanEx = false;
  @Input() destinationAddress;
  @Input() userEmail;

  @Input() set canyaContract(canyaContract: Contract) {
    console.log('setting up canyaContract: ', canyaContract);
    this.canyaCoinEthService.initContract(canyaContract.abi, canyaContract.address);
  }

  @Input() set postAuthorisationProcessResults(postAuthorisationProcessResults: ProcessActionResult) {
    this.doCompletePostAuthorisationProcess(postAuthorisationProcessResults);
  }

  View = View;
  Step = Step; // to access the enum from the .html template
  errMsg: string;
  warningMsg: string;
  steps: Array<any>;
  currStep: Step;
  title = 'Payment';
  balance = 0;
  account: string;
  confirmationDlg = {
    type: 'success',
    title: 'Sweet, payment done!',
    controls: {
      ok: true
    }
  };
  insufficientBalance = false;
  processSummaryMsg: string;
  balanceInterval: any;
  totalTransactions = 1;

  constructor(private canyaCoinEthService: CanYaCoinEthService, private formDataService: FormDataService) { }

  ngOnInit() {
    this.steps = [
      {
        name: 'AMOUNT',
        value: Step.paymentAmount,
        active: !this.amount && this.operation !== Operation.interact
      },
      {
        name: 'PAYMENT',
        value: Step.paymentSummary,
        active: this.operation !== Operation.interact
      },
      {
        name: 'PAYMENT',
        value: Step.metamask,
        active: true
      },
      {
        name: 'PAYMENT',
        value: Step.balanceCheck,
        active: this.operation !== Operation.interact
      },
      {
        name: 'PAYMENT',
        value: Step.canexPaymentOptions,
        active: !this.disableCanEx
      },
      {
        name: 'PAYMENT',
        value: Step.canexErc20,
        active: !this.disableCanEx
      },
      {
        name: 'PAYMENT',
        value: Step.canexQr,
        active: !this.disableCanEx
      },
      {
        name: 'PAYMENT',
        value: Step.canexProcessing,
        active: !this.disableCanEx
      },
      {
        name: 'Error',
        value: Step.canexError,
        active: !this.disableCanEx
      },
      {
        name: 'PAYMENT',
        value: Step.authorisation,
        active: this.operation === Operation.auth
      },
      {
        name: 'PAYMENT',
        value: Step.payment,
        active: this.operation === Operation.pay
      },
      {
        name: this.postAuthorisationProcessName,
        value: Step.process,
        active: !!this.postAuthorisationProcessName || this.operation === Operation.interact
      },
      {
        name: 'PAYMENT',
        value: Step.confirmation,
        active: true
      }
    ].filter(step => step.active);

    this.updateCurrentStep(this.steps.find(step => step.active === true).value);
    console.log('step: ', this.currStep);

    const validationErrors = [];
    if (!this.dAppName) {
      validationErrors.push('Missing dAppName');
    }

    if (!this.recipient) {
      validationErrors.push('Missing recipient address');
    }

    if (validationErrors.length) {
      this.error(validationErrors.join(' | '), false);
    }

    if (this.successText) {
      this.confirmationDlg.title = this.successText;
    }
  }


  ngOnDestroy() {
    if (this.balanceInterval) { clearInterval(this.balanceInterval); }
  }


  setAccount(_acc) {
    console.log('setAccount: ', _acc);
    this.account = _acc;
    setTimeout(() => this.operation === Operation.interact
      ? this.updateCurrentStep(Step.process)
      : !this.amount
        ? this.updateCurrentStep(Step.paymentAmount)
        : this.checkBalance(), 200);
  }

  setAmount(amount) {
    console.log('setAmount: ', amount);
    this.amount = amount;
    this.stepFinished();
  }

  checkBalance() {
    let isLoading = true;
    if (!this.balanceInterval) {
      this.balanceInterval = setInterval(() => {
        this.canyaCoinEthService.getCanYaBalance(this.canyaCoinEthService.getOwnerAccount())
          .then(_balance => {
            this.balance = Number(_balance);
            this.insufficientBalance = Number(_balance) < this.amount;
            if (!this.insufficientBalance) {
              this.stepFinished(Step.balanceCheck);
            } else if (isLoading) {
              isLoading = false;
              this.updateCurrentStep(Step.balanceCheck);
            }
          })
          .catch(err => this.error('Unable to retrieve user CAN balance!'));
      }, 2000);
    }
  }

  transactionSent() {
    this.totalTransactions += 1;
  }

  get showBackButton(): boolean {
    switch (this.currStep) {
      case Step.paymentAmount:
      case Step.paymentSummary:
        return true;
      case Step.canexPaymentOptions:
      case Step.canexErc20:
      case Step.canexQr:
      case Step.canexError:
        return true;
      case Step.balanceCheck:
      case Step.metamask:
      case Step.authorisation:
      case Step.payment:
      case Step.process:
        return true;
      case Step.confirmation:
      case Step.canexProcessing:
      default:
        return false;
    }
  }

  goBack() {
    switch (this.currStep) {
      case Step.paymentAmount:
        this.doCancel();
        break;
      case Step.paymentSummary:
        if (this.paymentSummary) {
          this.doCancel();
        } else {
          this.updateCurrentStep(Step.paymentAmount);
        }
        break;
      case Step.canexPaymentOptions:
        this.formDataService.resetFormData();
        this.updateCurrentStep(Step.balanceCheck);
        break;
      case Step.canexErc20:
      case Step.canexError:
        this.formDataService.resetFormData();
        this.updateCurrentStep(Step.canexPaymentOptions);
        break;
      case Step.canexQr:
        if (confirm('Are you sure you want to go back?')) {
          this.formDataService.resetFormData();
          this.updateCurrentStep(Step.canexPaymentOptions);
        }
        break;
      case Step.balanceCheck:
      case Step.metamask:
      case Step.authorisation:
      case Step.payment:
        this.cancelBalanceCheck();
        this.updateCurrentStep(Step.paymentSummary);
        break;
      case Step.process:
        if (this.operation === Operation.interact) {
          this.cancelBalanceCheck();
          this.doCancel();
        } else {
          this.cancelBalanceCheck();
          this.updateCurrentStep(Step.paymentSummary);
        }
        break;
      default:
        break;
    }
  }

  cancelBalanceCheck() {
    if (this.balanceInterval) { clearInterval(this.balanceInterval); this.balanceInterval = null; }
  }

  stepFinished(step: Step = this.currStep) {
    switch (step) {
      case Step.paymentAmount:
        this.updateCurrentStep(Step.paymentSummary);
        break;
      case Step.paymentSummary:
        if (this.canyaCoinEthService.account.value) {
          this.checkBalance();
        } else {
          this.updateCurrentStep(Step.metamask);
        }
        break;
      case Step.balanceCheck:
        this.cancelBalanceCheck();
        this.updateCurrentStep(this.postBalanceStep);
        break;
      case Step.canexProcessing:
        this.cancelBalanceCheck();
        this.updateCurrentStep(this.postBalanceStep);
        break;
      case Step.authorisation:
        this.cancelBalanceCheck();
        this.updateCurrentStep(this.postAuthorisationProcessName ? Step.process : Step.confirmation);
        break;
      case Step.payment:
        this.updateCurrentStep(this.postAuthorisationProcessName ? Step.process : Step.confirmation);
        break;
      default:
        break;
    }
  }

  updateCurrentStep(step) {
    if (step !== this.currStep) {
      this.warning(null);
      this.currStep = step;
      this.title = this.steps.find(x => x.value === step).name || 'Payment';
      this.currentStep.emit(step);
    }
  }

  get postBalanceStep() {
    return this.operation === Operation.auth ? Step.authorisation : this.operation === Operation.interact ? Step.process : Step.payment;
  }


  getCanExRecipient(): string {
    return this.destinationAddress || this.canyaCoinEthService.getOwnerAccount();
  }

  get hasPostAuthProcess() {
    return !!this.postAuthorisationProcessName || this.operation === Operation.interact;
  }

  doStartPostAuthorisationProcess() {
    this.startPostAuthorisationProcess.emit(this.canPayData());
  }

  doCompletePostAuthorisationProcess(postAuthorisationProcessResults) {
    if (!postAuthorisationProcessResults) { return; }

    if (postAuthorisationProcessResults.type === ProcessAction.success) {
      this.updateCurrentStep(Step.confirmation);
      return;
    }

    if (postAuthorisationProcessResults.type === ProcessAction.error) {
      return this.error(postAuthorisationProcessResults.msg);
    }
  }

  canPayData(): CanPayData {
    return {
      currStep: this.currStep,
      amount: this.amount,
      account: this.account,
      balance: this.balance
    };
  }

  doCancel() {
    this.cancel.emit(this.canPayData());
  }

  finish() {
    this.complete.emit(this.canPayData());
  }

  error(msg, autoDismiss = true) {
    this.errMsg = msg;
    if (autoDismiss) {
      setTimeout(() => this.errMsg = null, 10000);
    }
  }

  warning(msg, autoDismiss = false) {
    this.warningMsg = msg;
    if (autoDismiss) {
      setTimeout(() => this.errMsg = null, 10000);
    }
  }
}
