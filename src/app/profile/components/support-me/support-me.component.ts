import { Component, Input, OnInit } from '@angular/core';
import {
    CanPayData, CanPayService, Operation, ProcessAction, setProcessResult, View
} from '@canyaio/canpay-lib';

import { User } from '../../../core-classes/user';
import { CanWorkEthService } from '../../../core-services/eth.service';

@Component({
  selector: 'app-profile-support-me',
  templateUrl: './support-me.component.html',
  styleUrls: ['./support-me.component.css']
})
export class SupportMeComponent implements OnInit {

  @Input() userModel: User;

  CanPay: any;

  constructor(private ethService: CanWorkEthService, private canPayService: CanPayService) { }

  ngOnInit() {
    this.CanPay = {
      dAppName: this.userModel.name,
      recepient: this.userModel.ethAddress,
      operation: Operation.pay,
      amount: 0, // allow the user to enter amount through an input box
      complete: this.onComplete.bind(this),
      cancel: this.onCancel.bind(this),
      view: View.Compact
    };
  }

  onBuyACoffee() {
    this.canPayService.open(this.CanPay);
  }

  onComplete(canPayData: CanPayData) {
    console.log(JSON.stringify(canPayData));
    this.canPayService.close();
  }

  onCancel(canPayData: CanPayData) {
    console.log(JSON.stringify(canPayData));
    this.canPayService.close();
  }
}
