import { Component, Input, OnInit } from '@angular/core'
import { BinanceService } from '@service/binance.service'

@Component({
  selector: 'ledger-modal',
  templateUrl: './ledger-modal.component.html',
})
export class LedgerModalComponent implements OnInit {
  @Input() ledgerIndex: number = 0
  @Input() beforeAttempting = () => {}
  @Input() onSuccess = () => {}
  @Input() onFailure = () => {}

  constructor(
    private binanceService: BinanceService
  ) {}

  ngOnInit() {
    ;(window as any).$('#ledgerModal').on('shown.bs.modal', () => {
      this.connectLedger()
    })
  }

  private async connectLedger() {
    this.binanceService.connectLedger(
      this.ledgerIndex,
      this.beforeAttempting,
      this.onSuccess,
      this.onFailure
    )
  }
}
