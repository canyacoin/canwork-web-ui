import { Component } from '@angular/core';
import { DialogComponent, DialogService } from 'ng2-bootstrap-modal';

import { CanPay, Step } from '../interfaces';

export interface CanPayInit {
  canPay: CanPay;
}

@Component({
  selector: 'canyalib-canpay-modal',
  templateUrl: './canpay-modal.component.html',
  styleUrls: ['./canpay-modal.component.scss']
})
export class CanpayModalComponent extends DialogComponent<CanPayInit, boolean> {
  canPay: CanPay;
  step: any = {};
  Step = Step;

  constructor(dialogService: DialogService) {
    super(dialogService);
  }

  confirm() {
    this.result = true;
    this.close();
  }

  currentStep(step) {
    console.log('emitted step: ', step, this.step);
    this.step = step;
    if (this.canPay.currentStep) {
      this.canPay.currentStep(step);
    }
  }
}
