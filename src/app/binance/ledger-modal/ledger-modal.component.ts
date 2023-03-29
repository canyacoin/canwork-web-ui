import { Component, OnInit, OnDestroy, Directive } from '@angular/core'
import { ToastrService } from 'ngx-toastr'
import { Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'

@Component({
  selector: 'ledger-modal',
  templateUrl: './ledger-modal.component.html',
})
export class LedgerModalComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject()
  ledgerIndex: number = 0
  connectionInProgress: boolean = false

  constructor(private toastr: ToastrService) {}

  ngOnInit() {}

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }

  displayAddress() {
    this.connectionInProgress = true
    this.connectLedger()
  }

  private onConnectionFailure = (reason?: string) => {
    this.toastr.error(`Unable to connect wallet: ${reason}`)
  }

  private async connectLedger() {
    try {
      /*await this.binanceService.connectLedger(
        this.ledgerIndex,
        undefined,
        undefined,
        this.onConnectionFailure
      )*/
    } finally {
      ;(window as any).$('#ledgerModal').modal('hide')
    }
  }
}
