import { Injectable, OnDestroy } from '@angular/core';
import { EthService } from '@canyaio/canpay-lib';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import { environment } from '../../environments/environment';
import { canyaAbi, daoAbi } from '../contracts';

declare let require: any;

@Injectable()
export class CanWorkEthService extends EthService {

  constructor() {
    super({ contracts: { canyaCoinAddress: environment.contracts.canYaCoin } });
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
