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
  @Output() currentStep = new EventEmitter()

  @Input() view = View.Normal
  @Input() operation = Operation.auth
  @Input() successText
  @Input() amount = 0
  @Input() paymentSummary: PaymentSummary
  @Input() userEmail
  @Input() startJob
  @Input() initialisePayment

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

  constructor(private formDataService: FormDataService) {}

  ngOnInit() {
    this.steps = [
      {
        name: 'PAYMENT',
        value: Step.paymentSummary,
        active: this.operation !== Operation.interact,
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

  updateCurrentStep(step) {
    if (step !== this.currStep) {
      console.log('updateCurrentStep')
      this.warning(null)
      this.currStep = step
      this.title = this.steps.find(x => x.value === step).name || 'Payment'
      console.log('emit step: ' + step)
      this.currentStep.emit(step)
    }
  }

  canPayData(): CanPayData {
    console.log('canPayData')
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
    console.log('finish and emit')
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
