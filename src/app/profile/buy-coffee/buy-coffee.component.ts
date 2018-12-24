import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
    CanPay, CanPayData, Operation, ProcessAction, setProcessResult, View
} from '@canyaio/canpay-lib';
import { User } from '@class/user';
import { AuthService } from '@service/auth.service';
import { ChatService } from '@service/chat.service';
import { FeatureToggle, FeatureToggleService } from '@service/feature-toggle.service';
import { UserService } from '@service/user.service';

@Component({
  selector: 'app-buy-coffee',
  templateUrl: './buy-coffee.component.html',
  styleUrls: ['./buy-coffee.component.css']
})
export class BuyCoffeeComponent implements OnInit {

  userModel: User;
  currentUser: User;
  CanPay: any;
  canexDisabled = false;
  canPayOptions: CanPay;
  txHash: string;


  constructor(private authService: AuthService,
    private chatService: ChatService,
    private userService: UserService,
    private featureService: FeatureToggleService,
    private router: Router,
    private activatedRoute: ActivatedRoute, ) {
  }

  async ngOnInit() {
    const userId = this.activatedRoute.snapshot.params['address'] || null;
    if (userId) {
      const canexToggle = await this.featureService.getFeatureConfig('canexchange');
      this.canexDisabled = !canexToggle.enabled;
      this.userModel = await this.userService.getUser(userId);
      this.currentUser = await this.authService.getCurrentUser();
      if (this.userModel) {
        this.startCanpay();
      }
    }
  }

  startCanpay() {
    this.canPayOptions = {
      dAppName: this.userModel.name,
      recipient: this.userModel.ethAddress,
      onAuthTxHash: this.onAuthTxHash.bind(this),
      operation: Operation.pay,
      complete: this.onComplete.bind(this),
      cancel: this.onCancel.bind(this),
      disableCanEx: this.canexDisabled,
      userEmail: this.currentUser.email || ''
    };
  }

  onAuthTxHash(txHash: string, from: string) {
    this.txHash = txHash;
  }

  onCancel(canPayData: CanPayData) {
    this.router.navigate(['/profile/alt', this.userModel.address]);
  }

  async onComplete(canPayData: CanPayData) {
    await this.chatService.sendTipMessage(this.txHash, this.userModel.address);
    this.router.navigate(['/profile/alt', this.userModel.address]);
  }
}
