import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core'

import {
  CanPayData,
  Operation,
  PaymentSummary,
  ProcessAction,
  ProcessActionResult,
  Step,
  View,
} from '../interfaces'
import { FormDataService } from '../services/formData.service'

@Component({
  selector: 'canpay-wizard',
  templateUrl: './canpay-wizard.component.html',
  styleUrls: ['./canpay-wizard.component.scss'],
  // encapsulation: ViewEncapsulation.Native
})
export class CanpayWizardComponent implements OnInit, OnDestroy {
  @Output() complete = new EventEmitter()
  @Output() cancel = new EventEmitter()
  @Output() startPostAuthorisationProcess = new EventEmitter()
  @Output() currentStep = new EventEmitter()

  @Input() view = View.Normal
  @Input() postAuthorisationProcessName
  @Input() operation = Operation.auth
  @Input() onPaymentTxHash
  @Input() successText
  @Input() amount = 0
  @Input() paymentSummary: PaymentSummary
  @Input() userEmail
  @Input() startJob
  @Input() initialisePayment

  @Input() set postAuthorisationProcessResults(
    postAuthorisationProcessResults: ProcessActionResult
  ) {
    this.doCompletePostAuthorisationProcess(postAuthorisationProcessResults)
  }

  View = View
  Step = Step // to access the enum from the .html template
  errMsg: string
  warningMsg: string
  steps: Array<any>
  currStep: Step
  title = 'Payment'
  balance = 0
  account: string
  confirmationDlg = {
    type: 'success',
    title: 'Sweet, payment done!',
    controls: {
      ok: true,
    },
  }
  insufficientBalance = false
  processSummaryMsg: string
  balanceInterval: any
  totalTransactions = 1

  constructor(private formDataService: FormDataService) {}

  ngOnInit() {
    this.steps = [
      {
        name: 'PAYMENT',
        value: Step.paymentSummary,
        active: this.operation !== Operation.interact,
      },
      {
        name: this.postAuthorisationProcessName,
        value: Step.process,
        active:
          !!this.postAuthorisationProcessName ||
          this.operation === Operation.interact,
      },
      {
        name: 'PAYMENT',
        value: Step.confirmation,
        active: true,
      },
    ].filter(step => step.active)

    this.updateCurrentStep(this.steps.find(step => step.active === true).value)
    console.log('step: ', this.currStep)

    const validationErrors = []
    if (validationErrors.length) {
      this.error(validationErrors.join(' | '), false)
    }

    if (this.successText) {
      this.confirmationDlg.title = this.successText
    }
  }

  ngOnDestroy() {
    if (this.balanceInterval) {
      clearInterval(this.balanceInterval)
    }
  }

  transactionSent() {
    this.totalTransactions += 1
  }

  get showBackButton(): boolean {
    switch (this.currStep) {
      case Step.paymentSummary:
        return true
      default:
        return false
    }
  }

  goBack() {
    switch (this.currStep) {
      case Step.paymentSummary:
        if (this.paymentSummary) {
          this.doCancel()
        }
        break
      default:
        break
    }
  }

  cancelBalanceCheck() {
    if (this.balanceInterval) {
      clearInterval(this.balanceInterval)
      this.balanceInterval = null
    }
  }

  stepFinished(step: Step = this.currStep) {
    switch (step) {
      case Step.paymentSummary:
        this.updateCurrentStep(Step.confirmation)
        break
      default:
        break
    }
  }

  updateCurrentStep(step) {
    if (step !== this.currStep) {
      this.warning(null)
      this.currStep = step
      this.title = this.steps.find(x => x.value === step).name || 'Payment'
      this.currentStep.emit(step)
    }
  }

  get hasPostAuthProcess() {
    return (
      !!this.postAuthorisationProcessName ||
      this.operation === Operation.interact
    )
  }

  doStartPostAuthorisationProcess() {
    this.startPostAuthorisationProcess.emit(this.canPayData())
  }

  doCompletePostAuthorisationProcess(postAuthorisationProcessResults) {
    if (!postAuthorisationProcessResults) {
      return
    }

    if (postAuthorisationProcessResults.type === ProcessAction.success) {
      this.updateCurrentStep(Step.confirmation)
      return
    }

    if (postAuthorisationProcessResults.type === ProcessAction.error) {
      return this.error(postAuthorisationProcessResults.msg)
    }
  }

  canPayData(): CanPayData {
    return {
      currStep: this.currStep,
      amount: this.amount,
      account: this.account,
      balance: this.balance,
    }
  }

  doCancel() {
    this.cancel.emit(this.canPayData())
  }

  finish() {
    this.complete.emit(this.canPayData())
  }

  error(msg, autoDismiss = true) {
    this.errMsg = msg
    if (autoDismiss) {
      setTimeout(() => (this.errMsg = null), 10000)
    }
  }

  warning(msg, autoDismiss = false) {
    this.warningMsg = msg
    if (autoDismiss) {
      setTimeout(() => (this.errMsg = null), 10000)
    }
  }
}
