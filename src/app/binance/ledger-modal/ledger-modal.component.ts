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

  hide() {
    ;(window as any).$('#ledgerModal').modal('hide')
  }

  private async connectLedger() {
    const onSuccess = () => {
      this.onSuccess()
      this.hide()
    }

    const onFailure = () => {
      this.onFailure()
      this.hide()
    }

    this.binanceService.connectLedger(
      this.ledgerIndex,
      this.beforeAttempting,
      onSuccess,
      onFailure
    )
  }
}
