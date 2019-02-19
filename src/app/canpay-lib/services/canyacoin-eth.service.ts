import { Inject, Injectable, OnDestroy } from '@angular/core';
import { Http } from '@angular/http';
import merge from 'lodash.merge';

import { canyaAbi } from '../../contracts';
import { EthService } from './eth.service';

const DEFAULT_CONFIGS = {
  useTestNet: false,
  contracts: {
    canyaCoinAddress: '',
    canyaCoinAbi: canyaAbi
  }
};

@Injectable()
export class CanYaCoinEthService extends EthService {
  canyaContract: any;

  decimals = 6;

  constructor(@Inject('Config') private config: any = {}, http: Http) {
    super({ useTestNet: config.useTestNet }, http);
    this.config = merge(DEFAULT_CONFIGS, config);
    this.initContract();
  }

  initContract(abi = this.config.contracts.canyaCoinAbi, address = this.config.contracts.canyaCoinAddress) {
    console.log('CanYaCoinEthService configs: ', this.config);

    // const tokenImage = 'https://canstyle.io/assets/img/canya-circle.svg';

    // this.web3js.sendAsync({
    //     method: 'wallet_watchAsset',
    //     params: {
    //       'type': 'ERC20',
    //       'options': {
    //         'address': address,
    //         'symbol': `CAN`,
    //         'decimals': this.decimals,
    //         'image': tokenImage,
    //       },
    //     },
    //     id: Math.round(Math.random() * 100000),
    // }, (err, added) => {
    //   if (added) {
    //     console.log('Thanks for your interest!');
    //   } else {
    //     console.log('Your loss!');
    //   }
    // });
    return this.canyaContract = this.createContractInstance(abi, address);
  }

  getAmountWithDecimals(canAmount: number): number {
    return canAmount * (10 ** this.decimals);
  }

  async getAllowance(owner: string, spender: string): Promise<number> {
    try {
      const allowance = await this.canyaContract.methods.allowance(owner, spender).call();
      console.log('Allowance: ', allowance);
      return Promise.resolve(allowance);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async hasAllowance(owner: string, spender: string, amount: number): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        const allowance = await this.getAllowance(owner, spender);
        resolve(allowance >= this.getAmountWithDecimals(amount));
      } catch (e) {
        resolve(false);
      }
    });
  }

  async getCanYaBalance(userAddress: string = this.getOwnerAccount()): Promise<string> {
    try {
      if (userAddress) {
        const balance = await this.canyaContract.methods.balanceOf(userAddress).call();
        console.log('CAN balance: ', balance);
        const t = this.web3js.utils.toBN(balance);
        return Promise.resolve(t.div(this.web3js.utils.toBN(10 ** this.decimals)).toString());
      }

      return Promise.resolve('0.00');
    } catch (error) {
      console.error('CanYaCoinEthService: getCanYaBalance - error', error);
      return Promise.reject(error);
    }
  }

  authoriseCANPayment(torecipient, amount, from: string = this.getOwnerAccount(), onTxHash: Function = null): Promise<any> {
    console.log('CanYaCoinEthService: authoriseCANPayment: ', from, torecipient, amount);
    return new Promise(async (resolve, reject) => {
      const tx = await this.canyaContract.methods.approve(torecipient, this.amountToCANTokens(amount));
      const gas = await tx.estimateGas();
      const gasPrice = await this.getDefaultGasPriceGwei();
      tx.send({ from, gas, gasPrice }, async (err, txHash) => this.resolveTransaction(err, from, txHash, resolve, reject, onTxHash));
    });
  }

  payWithCAN(torecipient, amount, from = this.getOwnerAccount(), onTxHash: Function = null): Promise<any> {
    console.log('CanYaCoinEthService: payWithCAN: ', from, torecipient, amount);
    return new Promise(async (resolve, reject) => {
      const tx = await this.canyaContract.methods.transfer(torecipient, this.amountToCANTokens(amount));
      let gas, gasPrice;
      try {
        gas = await tx.estimateGas({ from });
        gasPrice = await this.getDefaultGasPriceGwei();
      } catch (e) {
        reject(e);
      }
      tx.send({ from, gas, gasPrice }, async (err, txHash) => this.resolveTransaction(err, from, txHash, resolve, reject, onTxHash));
    });
  }



  payWithERC20(amount, recipient, token, decimal, gas) {
    console.log('CanYaCoinEthService: payWithErc20Token: ', amount, token, decimal, gas);
    this.payWithErc20Token(this.config.contracts.canyaCoinAbi, recipient, amount, token, decimal, gas);
  }
}
