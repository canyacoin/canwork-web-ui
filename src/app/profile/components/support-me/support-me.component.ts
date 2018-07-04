import { Component, Input, OnInit } from '@angular/core';
import {
    CanPayData, CanPayService, Operation, ProcessAction, setProcessResult
} from '@canyaio/canpay-lib';

import { User } from '../../../core-classes/user';
import { EthService } from '../../../core-services/eth.service';

@Component({
  selector: 'app-profile-support-me',
  templateUrl: './support-me.component.html',
  styleUrls: ['./support-me.component.css']
})
export class SupportMeComponent implements OnInit {

  @Input() userModel: User;

  CanPay: any;

  constructor(private ethService: EthService, private canPayService: CanPayService) { }

  ngOnInit() {
    this.CanPay = {
      dAppName: 'CANWork',
      recepient: this.userModel.ethAddress,
      operation: Operation.pay,
      amount: 0, // allow the user to enter amount through an input box
      complete: this.onComplete.bind(this),
      cancel: this.onCancel.bind(this),
    };
  }

  onBuyACoffee() {
    this.canPayService.open(this.CanPay);
  }

  onComplete(canPayData: CanPayDat) {
    console.log(JSON.stringify(canPayData));
    this.canPayService.close();
  }

  onCancel(canPayData: CanPayDat) {
    console.log(JSON.stringify(canPayData));
    this.canPayService.close();
  }
}
