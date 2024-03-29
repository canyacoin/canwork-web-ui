import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Directive,
} from '@angular/core'

import { PaymentSummary } from '../interfaces'
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
  @Input() paymentSummary: PaymentSummary
  @Input() initialisePayment

  errMsg: string
  warningMsg: string
  showPaymentSummary = false
  showConfirmation = false

  title = 'Payment'

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

  goBack() {
    this.cancel.emit()
  }

  finish() {
    console.log('Wiz Finish')
    this.complete.emit()
  }

  confirmSuccess() {
    console.log('Wiz confirmSuccess')
    this.showPaymentSummary = false
    this.confirmationDlg.title = this.successText
    this.showConfirmation = true
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
