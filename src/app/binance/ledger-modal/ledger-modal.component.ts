import { Component, OnInit, OnDestroy } from '@angular/core'
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

  ngOnInit() {
    this.binanceService.events$
      .pipe(takeUntil(this.destroy$))
      .subscribe(async event => {
        if (!event) {
          return
        }
        switch (event.type) {
          case EventType.Init:
            const { ledgerIndex } = event.details
            if (ledgerIndex !== undefined) {
              this.connectionInProgress = false
              this.ledgerIndex = ledgerIndex
              ;(window as any).$('#ledgerModal').modal('show')
            }
            break
        }
      })
  }

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
      await this.binanceService.connectLedger(
        this.ledgerIndex,
        undefined,
        undefined,
        this.onConnectionFailure
      )
    } finally {
      ;(window as any).$('#ledgerModal').modal('hide')
    }
  }
}
