import { Component, Input, OnInit } from '@angular/core';
import { WalletType, Web3LoadingStatus } from '@canyaio/canpay-lib';

@Component({
  selector: 'app-wallet-install',
  templateUrl: './wallet-install.component.html',
  styleUrls: ['./wallet-install.component.css']
})
export class WalletInstallComponent implements OnInit {

  @Input() walletType: WalletType;
  @Input() web3State: Web3LoadingStatus;

  walletTypes = WalletType;
  web3LoadingStatus = Web3LoadingStatus;

  constructor() { }

  ngOnInit() {
  }

}
