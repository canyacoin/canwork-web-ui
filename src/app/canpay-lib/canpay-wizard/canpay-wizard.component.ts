import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core'

import { CanPayData, PaymentSummary } from '../interfaces'
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

  @Input() successText
  @Input() amount = 0
  @Input() paymentSummary: PaymentSummary
  @Input() userEmail
  @Input() startJob
  @Input() initialisePayment

  errMsg: string
  warningMsg: string
  steps: Array<any>
  showPaymentSummary = false
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

  constructor(private formDataService: FormDataService) {}

  ngOnInit() {
    this.showPaymentSummary = true
  }

  ngOnDestroy() {}

  get showBackButton(): boolean {
    return true
  }

  goBack() {
    this.doCancel()
  }

  canPayData(): CanPayData {
    console.log('canPayData')
    return {
      amount: this.amount,
      account: this.account,
      balance: this.balance,
    }
  }

  doCancel() {
    this.cancel.emit(this.canPayData())
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
