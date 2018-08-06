import { Component, OnInit } from '@angular/core';
import { NetworkType, WalletType, Web3LoadingStatus } from '@canyaio/canpay-lib';
import { Subscription } from 'rxjs/Subscription';
import { CanWorkEthService } from '@service/eth.service';
@Component({
  selector: 'app-status-light',
  templateUrl: './status-light.component.html',
  styleUrls: ['./status-light.component.css']
})
export class StatusLightComponent implements OnInit {

  web3Sub: Subscription;
  accountSub: Subscription;
  web3State: Web3LoadingStatus;
  netType: NetworkType;
  accountInterval: any;
  account: string;
  canBalance = '0.00';
  statusInterval: any;
  walletStatus: any;

  constructor(
    private ethService: CanWorkEthService
  ) { }

  ngOnInit() {
    this.web3Sub = this.ethService.web3Status$.subscribe((state: Web3LoadingStatus) => {
      this.web3State = state;
      this.netType = this.ethService.netType;
      if (this.web3State === Web3LoadingStatus.complete) {
        this.accountSub = this.ethService.account$.subscribe((acc: string) => {
          this.account = acc;
          if (acc === undefined || acc == null) {
            clearInterval(this.accountInterval);
          } else {
            this.updateBalanceAsync();
            this.accountInterval = setInterval(async () => {
              this.updateBalanceAsync();
            }, 120000);
          }
        });
      }
    });
    console.log(this.netType);
  }

  async updateBalanceAsync() {
    const bal = await this.ethService.getCanYaBalance();
    this.canBalance = bal;
  }

  getWeb3Color(): string {
    switch (this.web3State) {
      case Web3LoadingStatus.complete:
        return '#30D7A9';
      case Web3LoadingStatus.noAccountsAvailable:
       return '#ffc600';
      case Web3LoadingStatus.loading:
        return '#ffc600';
      case Web3LoadingStatus.error:
        return '#ff4954';
      case Web3LoadingStatus.noMetaMask:
        return '#ff4954'
      case Web3LoadingStatus.wrongNetwork:
        return '#b7bbbd';
      default:
        return '#ff4954';
    }
  }

  setWalletStatus() {
    switch (this.web3State) {
      case Web3LoadingStatus.noAccountsAvailable:
        this.walletStatus = 'noAccount';
        break;
      case Web3LoadingStatus.loading:
        this.walletStatus = 'loading';
       break;
      case Web3LoadingStatus.error:
       this.walletStatus = 'error';
       break;
      case Web3LoadingStatus.noMetaMask:
        this.walletStatus = 'noMetamask';
        break;
      case Web3LoadingStatus.wrongNetwork:
        this.walletStatus = 'wrongNetwork';
        break;
      default:
        this.walletStatus = 'loading';
    }

  }
  getWeb3Message(): string {
    switch (this.web3State) {
      case Web3LoadingStatus.noAccountsAvailable:
       return 'Please unlock your wallet.';
      case Web3LoadingStatus.loading:
        return 'Loading...';
      case Web3LoadingStatus.error:
        return 'An error occured. Please refresh the page.';
      case Web3LoadingStatus.noMetaMask:
        return 'Please install metamask.';
      case Web3LoadingStatus.wrongNetwork:
        return 'Please switch to mainnet.';
      case Web3LoadingStatus.complete:
        return 'Signed in to metamask.';
      default:
        return 'Please install metamask.';
    }
  }
}
