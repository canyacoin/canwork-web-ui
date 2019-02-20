import { Injectable, OnDestroy } from '@angular/core';
import { DialogService } from 'ng2-bootstrap-modal/dist/dialog.service';

import { CanpayModalComponent } from '../canpay-modal/canpay-modal.component';
import { CanPay } from '../interfaces';

export type SubscribeFn = (isConfirmed: boolean) => void;

@Injectable()
export class CanPayService implements OnDestroy {
  canPayModal;

  constructor(private dialogService: DialogService) { }

  ngOnDestroy() {
    this.close();
  }

  open(canPay: CanPay, subscribeFn: SubscribeFn = this.close) {
    this.canPayModal = this.dialogService.addDialog(CanpayModalComponent, { canPay }).subscribe(subscribeFn);
  }

  close() {
    if (this.canPayModal) {
      this.canPayModal.unsubscribe();
    }
  }
}
