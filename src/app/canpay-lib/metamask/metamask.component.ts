import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';

import { EthService, WalletType, Web3LoadingStatus } from '../services/eth.service';

@Component({
  selector: 'canyalib-metamask',
  templateUrl: './metamask.component.html',
  styleUrls: ['./metamask.component.scss']
})

export class MetamaskComponent implements OnInit, OnDestroy {
  @Input() initLogin = true;
  @Output() loginResp = new EventEmitter();
  @Output() account = new EventEmitter<string>();
  //   status = 'loading';
  web3LoadingStatus = Web3LoadingStatus;
  web3State: Web3LoadingStatus;

  walletType: WalletType;
  walletTypes = WalletType;

  configUseTestNet = false;

  loading = true;

  ethSub: Subscription;
  accSub: Subscription;

  showInstructions = false;

  constructor(private ethService: EthService) { }

  async ngOnInit() {
    this.configUseTestNet = this.ethService.configUseTestNet;
    this.ethSub = this.ethService.web3Status$.subscribe((state: Web3LoadingStatus) => {
      console.log('state: ', state);
      this.web3State = state;
      if (this.web3State !== Web3LoadingStatus.loading) {
        this.walletType = this.ethService.walletType;
        this.accSub = this.ethService.account$.subscribe((acc: string) => {
          if (!acc) { return; }
          console.log('accSub: ', acc);
          this.loading = true;
          this.account.emit(acc);
        });
      }
    });
  }

  getAccount() {
    const acc = this.ethService.getOwnerAccount();
    if (acc) {
      this.loading = true;
      this.account.emit(acc);
    }
  }

  showHideInstructions() {
    this.showInstructions = !this.showInstructions;
  }

  get netType(): string {
    return this.configUseTestNet ? 'Test Network' : 'Main Network';
  }

  ngOnDestroy() {
    if (this.ethSub) { this.ethSub.unsubscribe(); }
    if (this.accSub) { this.accSub.unsubscribe(); }
  }
}

