import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import { canyaContractAddress } from '../core-config/contracts';

declare let require: any;
const Web3 = require('web3');
declare var web3;

const canyaAbi = require('assets/abi/canyaABI.json');

export enum Web3LoadingStatus {
  loading = 'Wallet loading is in progress',
  noMetaMask = 'MetaMask is not connected.',
  noAccountsAvailable = 'MetaMask is locked or there are no accounts available.',
  wrongNetwork = 'Your MetaMask is connected to the wrong Network.',
  error = 'Something went wrong when connecting to your MetMask wallet',
  complete = 'Successfully connected to your MetaMask wallet'
}

@Injectable()
export class EthService implements OnDestroy {

  isMainNet: boolean;
  isMetaMask: boolean;
  web3js: any;
  accountInterval: any;

  canyaContract: any = null;

  public web3Status = new BehaviorSubject<Web3LoadingStatus>(Web3LoadingStatus.loading);
  public web3Status$ = this.web3Status.asObservable();

  public account = new BehaviorSubject<string>(null);
  public account$ = this.account.asObservable();

  constructor() {
    if (typeof web3 !== 'undefined') {
      this.web3js = new Web3(web3.currentProvider);
      this.isMetaMask = true;
      try {
        this.web3js.eth.net.getId().then((id: number) => {
          console.log('Web3Service: Network retrieved: ID= ' + id);
          switch (id) {
            case 1:
              this.isMainNet = true;
              console.log('Web3Service: Is MainNet');
              this.web3js.eth.getAccounts().then((accs: string[]) => {
                console.log('Web3Service: Got accounts: ' + JSON.stringify(accs));
                if (accs[0]) {
                  this.account.next(accs[0]);
                  this.web3Status.next(Web3LoadingStatus.complete);
                } else {
                  this.account.next(accs[0]);
                  this.web3Status.next(Web3LoadingStatus.noAccountsAvailable);
                }
                this.accountInterval = setInterval(() => {
                  this.checkAccountMetaMask();
                }, 500);
              });
              this.canyaContract = new this.web3js.eth.Contract(canyaAbi, canyaContractAddress);
              return;
            default:
              this.isMainNet = false;
              console.log('Web3Service: Is Not MainNet');
              this.web3Status.next(Web3LoadingStatus.wrongNetwork);
              return;
          }
        });
      } catch (e) {
        console.log('Web3Service: Error: ID');
        this.web3Status.next(Web3LoadingStatus.error);
      }
    } else {
      // this.setProvider(new Web3.providers.HttpProvider('https://ropsten.infura.io/'));
      this.web3Status.next(Web3LoadingStatus.noMetaMask);
    }
  }

  ngOnDestroy() {
    clearInterval(this.accountInterval);
  }

  checkAccountMetaMask() {
    this.web3js.eth.getAccounts().then((accs: string[]) => {
      console.log('Web3Service: loadedaccounts: ' + JSON.stringify(accs));
      if (accs[0] !== this.account.value) {
        console.log('Web3Service: new account found: ' + JSON.stringify(accs[0]));
        if (accs[0] !== undefined) {
          if (this.web3Status.value !== Web3LoadingStatus.complete) {
            this.web3Status.next(Web3LoadingStatus.complete);
          }
        } else {
          this.web3Status.next(Web3LoadingStatus.noAccountsAvailable);
        }
        this.account.next(accs[0]);
      }
    });
  }

  async getEthBalanceAsync(userAddress: string = this.account.value): Promise<string> {
    // TODO  - confirm useraddress has 0x
    const balance = await this.web3js.eth.getBalance(userAddress);
    if (balance) {
      console.log(balance);
      const tokens = this.web3js.utils.toBN(balance).toString();
      console.log('Eth Owned: ' + this.web3js.utils.fromWei(tokens, 'ether'));
      return Promise.resolve(tokens);
    }
    return Promise.reject(null);
  }

  async getCanYaBalance(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const acc = this.account.value;
        if (acc) {
          const balance = await this.canyaContract.methods.balanceOf(acc).call();
          const t = this.web3js.utils.toBN(balance);
          resolve(t.div(this.web3js.utils.toBN(1000000)).toString());
        } else {
          resolve('0.00');
        }
      } catch (error) {
        console.error('getBalance - error', error);
        reject();
      }
    }) as Promise<string>;
  }

  buyCoffee(addr: string, number: number) {
    return new Promise((resolve, reject) => {
      // const transaction = {
      //   gasLimit: 48000,
      //   gasPrice: '0x04e3b29200',
      //   to: canyaContractAddress,
      //   data: this.canyaContract.methods.transfer(toAddress, this.web3.utils.toWei(amount.toString(), 'ether')).encodeABI(),
      //   value: '0x0'
      // };

      // this.web3.eth.sendTransaction(transaction).on('transactionHash', (hash) => {
      //   console.log('EthService - hash', hash);
      //   resolve(hash);
      // }).on('receipt', (receipt) => {
      //   console.log('EthService - receipt', receipt);
      // }).on('confirmation', (confirmationNumber, receipt) => {
      //   console.log('EthService - confirmationNumber', confirmationNumber, receipt);
      // }).on('error', (error, receipt) => {
      //   console.log('EthService - error', error, receipt);
      //   reject(error);
      // });
      resolve();
    }) as Promise<string>;
  }

  payCAN(recipient: string, amount: number) {
    const transaction = {
      gasLimit: 48000,
      gasPrice: '0x04e3b29200',
      to: canyaContractAddress,
      data: this.canyaContract.methods.transfer(recipient, this.web3js.utils.toWei(amount.toString(), 'ether')).encodeABI(),
      value: '0x0'
    };
    return Observable.fromPromise(this.web3js.eth.sendTransaction(transaction));
  }
}
