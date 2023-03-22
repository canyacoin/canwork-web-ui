import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Directive,
} from '@angular/core'
import { ToastrService } from 'ngx-toastr'

import { PaymentSummary } from '../interfaces'

@Directive()
@Component({
  selector: 'payment-summary',
  templateUrl: './payment-summary.component.html',
  styleUrls: ['./payment-summary.component.scss'],
})
export class PaymentSummaryComponent implements OnInit {
  @Output() error = new EventEmitter()
  @Output() confirmSuccess = new EventEmitter()
  @Input() paymentSummary: PaymentSummary = null
  @Input() initialisePayment

  isLoading = false

  constructor(private toastr: ToastrService) {}

  ngOnInit() {
    console.log('Payment Summary: ')
    console.log(this.paymentSummary)
  }

  next() {
    console.log('NEXT')
    const beforeTransaction = () => {
      console.log('beforeTransaction')
      this.isLoading = true
    }

    const onSuccess = () => {
      console.log('onSuccess')
      this.confirmSuccess.emit()
    }

    const onFailure = () => {
      console.log('onFailure')
      this.isLoading = false
    }

    this.initialisePayment(beforeTransaction, onSuccess, onFailure)
  }
}
