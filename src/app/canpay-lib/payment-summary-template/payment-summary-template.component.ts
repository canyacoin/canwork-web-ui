import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Directive,
} from '@angular/core'
import { PaymentSummary } from '../interfaces'

@Directive()
@Component({
  selector: 'payment-summary-template',
  templateUrl: './payment-summary-template.component.html',
  styleUrls: ['./payment-summary-template.component.scss'],
})
export class PaymentSummaryTemplateComponent implements OnInit {
  @Input() paymentSummary: PaymentSummary = null

  formatAssetJobBudget: string
  assetSymbolShort: string
  paymentAssetIconURL: string

  constructor() {}

  ngOnInit() {
    if (!this.paymentSummary) {
      console.log('No Payment Summary')
    }

    //TODO:  The following could be moved into a service
    // Shorten Asset Symbol, splitting before the hyphen (eg.  CAN-677 -> CAN)
    let splittedSymbol = this.paymentSummary.asset.symbol.split('-')
    this.assetSymbolShort =
      splittedSymbol.length > 1
        ? splittedSymbol[0]
        : this.paymentSummary.asset.symbol

    // Format the atomic asset job budget for readability
    this.formatAssetJobBudget = (
      this.paymentSummary.jobBudgetAtomic / 1e8
    ).toFixed(5)
  }
}
