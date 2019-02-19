import { Injectable, OnDestroy } from '@angular/core';
import { Http, Response } from '@angular/http';
import { CanYaCoinEthService, EthService } from '@canpay-lib/lib';
import { environment } from '@env/environment';
import { BehaviorSubject ,  Observable ,  Subject ,  Subscription } from 'rxjs';

import { canyaAbi, daoAbi } from '../contracts';

declare let require: any;

@Injectable()
export class CanWorkEthService extends EthService {

  constructor(
    http: Http,
    private canyaCoinEthService: CanYaCoinEthService) {
    super({ contracts: { canyaCoinAddress: environment.contracts.canYaCoin } }, http);
  }

  async getCanYaBalance(userAddress: string = this.canyaCoinEthService.getOwnerAccount()) {
    return this.canyaCoinEthService.getCanYaBalance(userAddress);
  }

  async getCanToUsd(): Promise<number> {
    const canToUsdResp = await this.http.get('https://api.coinmarketcap.com/v2/ticker/2343/?convert=USD').toPromise();
    if (canToUsdResp.ok) {
      return Promise.resolve(JSON.parse(canToUsdResp.text())['data']['quotes']['USD']['price'] || 0);
    }
    return Promise.resolve(0);
  }

  parseHexToA(hexx) {
    const hex = hexx.toString();
    let str = '';
    for (let i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2) {
      if (hex.substr(i, 2) !== '0x') {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
      }
    }
    return str;
  }
}
