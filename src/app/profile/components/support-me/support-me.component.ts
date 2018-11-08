import { Component, Input } from '@angular/core';
import {
    CanPayData, CanPayService, Operation, ProcessAction, setProcessResult, View
} from '@canyaio/canpay-lib';
import { User } from '@class/user';
import { CanWorkEthService } from '@service/eth.service';
import { FeatureToggle, FeatureToggleService } from '@service/feature-toggle.service';

@Component({
  selector: 'app-profile-support-me',
  templateUrl: './support-me.component.html',
  styleUrls: ['./support-me.component.css']
})
export class SupportMeComponent {

  @Input() userModel: User;
  @Input() currentUser: User;

  CanPay: any;

  canexDisabled = false;

  constructor(private ethService: CanWorkEthService, private canPayService: CanPayService, private featureService: FeatureToggleService) {
    this.featureService.getFeatureConfig('canexchange').then(val => {
      this.canexDisabled = !val.enabled;
    }).catch(e => {
      this.canexDisabled = true;
    })
  }

  onBuyACoffee() {
    const canPay = {
      dAppName: this.userModel.name,
      recepient: this.userModel.ethAddress,
      operation: Operation.pay,
      amount: 0, // allow the user to enter amount through an input box
      complete: this.onComplete.bind(this),
      cancel: this.onCancel.bind(this),
      view: View.Compact,
      disableCanEx: this.canexDisabled,
      userEmail: this.currentUser.email
    }
    this.canPayService.open(canPay);
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
