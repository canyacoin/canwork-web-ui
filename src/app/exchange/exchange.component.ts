import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { EthService, WalletType, Web3LoadingStatus } from '../core-services/eth.service';
import { ScriptService } from '../core-services/script.service';

@Component({
  selector: 'app-exchange',
  templateUrl: './exchange.component.html',
  styleUrls: ['./exchange.component.css']
})
export class ExchangeComponent implements AfterViewInit, OnDestroy {

  web3LoadingStatus = Web3LoadingStatus;
  web3State: Web3LoadingStatus = Web3LoadingStatus.loading;
  walletType: WalletType;
  account: string;
  balance = '0';

  web3Subscription: Subscription;
  accountSubscription: Subscription;

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private ethService: EthService,
    private scriptService: ScriptService) {
  }

  async ngAfterViewInit() {
    this.web3Subscription = this.ethService.web3Status$.subscribe((status: Web3LoadingStatus) => {
      console.log('Terminal: Web3Status: ' + status);

      this.web3State = status;
      this.walletType = this.ethService.walletType;
      if (status === Web3LoadingStatus.complete) {
        this.scriptService.loadScript('bancor').then(res => {
          this.scriptService.loadScript('bancor-config');
        });
        this.accountSubscription = this.ethService.account$.subscribe(async (acc: string) => {
          if (acc !== undefined) {
            this.account = acc;
            this.ethService.getCanYaBalance().then((data: any) => {
              this.balance = data;
            });
          }
        });
      } else if (status != null) {
        this.account = null;
      }
    });
  }

  ngOnDestroy() {
    this.web3Subscription.unsubscribe();
    if (this.accountSubscription !== undefined) {
      this.accountSubscription.unsubscribe();
    }
  }
}
