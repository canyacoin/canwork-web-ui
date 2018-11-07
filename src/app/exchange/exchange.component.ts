import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WalletType, Web3LoadingStatus } from '@canyaio/canpay-lib';
import { Subscription } from 'rxjs/Subscription';

import { CanWorkEthService } from '../core-services/eth.service';
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

  exchanges = [
    {
      name: 'KuCoin',
      url: 'https://www.kucoin.com/#/trade.pro/CAN-BTC'
    },
    {
      name: 'xBrick',
      url: 'https://xbrick.io/',
    },
    {
      name: 'AEX',
      url: 'https://www.aex.com/'
    },
    {
      name: 'Cryptopia',
      url: 'https://www.cryptopia.co.nz/Exchange/?market=CAN_BTC'
    },
    {
      name: 'CoinSpot',
      url: 'https://www.coinspot.com.au/buy/can'
    },
    {
      name: 'EtherDelta',
      url: 'https://etherdelta.com/#0x1d462414fe14cf489c7a21cac78509f4bf8cd7c0-ETH'
    },
    {
      name: 'Coss.io',
      url: 'https://exchange.coss.io/exchange/can-eth'
    },
    {
      name: 'Qryptos',
      url: 'https://trade.qryptos.com/basic/CANETH'
    },
    {
      name: 'Radar Relay',
      url: 'https://app.radarrelay.com/CAN/WETH'
    },
    {
      name: 'IDEX',
      url: 'https://idex.market/eth/can'
    },
    {
      name: 'Gatecoin',
      url: 'https://gatecoin.com/markets/caneth'
    },
    {
      name: 'Coinswitch',
      url: 'https://coinswitch.co/'
    },
    {
      name: 'IDAX',
      url: 'https://www.idax.mn/#/exchange?pairname=CAN_ETH'
    }
  ];

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private ethService: CanWorkEthService,
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
