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

  daoContract: any;

  constructor() {
    // super({contracts: {
    //   useTestNet: environment.contracts.useTestNet,
    //   canyaCoinAddress: environment.contracts.canYaCoin,
    //   canyaAbi: canyaAbi
    // }});
    super({ contracts: { canyaCoinAddress: environment.contracts.canYaCoin } });
    this.daoContract = this.createContractInstance(daoAbi, environment.contracts.canYaDao);
  }

  async providerHasBeenAccepted(addr: string): Promise<boolean> {
    const isProvider = await this.daoContract.methods.isProvider(addr).call();
    return Promise.resolve(isProvider);
  }

  async getProviderBadge(addr: string): Promise<string> {
    const badge = await this.daoContract.methods.getProviderBadge(addr).call();
    if (this.web3js.utils.isHex(badge)) {
      return Promise.resolve(this.parseHexToA(badge));
    }
    return Promise.resolve(null);
  }

  async providerHasBeenRejected(addr: string): Promise<boolean> {
    const isRejected = await this.daoContract.methods.isRejected(addr).call();
    return Promise.resolve(isRejected);
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
