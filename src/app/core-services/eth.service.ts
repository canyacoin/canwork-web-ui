import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import { environment } from '../../environments/environment';

declare let require: any;
const Web3 = require('web3');
declare var web3;

const canyaAbi = require('assets/abi/canyaABI.json');
const daoAbi = require('assets/abi/daoABI.json');
const canDecimals = 6;
const gas = { gasPrice: '8000000000', gas: '210000' };

export enum WalletType {
  metaMask = 'MetaMask',
  trust = 'Trust'
}

export enum NetworkType {
  main = 'Mainnet',
  ropsten = 'Ropsten',
  rinkeby = 'Rinkeby',
  unknown = 'Unknown'
}

export enum Web3LoadingStatus {
  loading = 'Wallet loading is in progress',
  noMetaMask = 'Wallet is not connected.',
  noAccountsAvailable = 'Your wallet is locked or there are no accounts available.',
  wrongNetwork = 'Your wallet is connected to the wrong Network.',
  error = 'Something went wrong when connecting to your wallet',
  complete = 'Successfully connected to your wallet'
}

@Injectable()
export class EthService implements OnDestroy {

  web3js: any;
  accountInterval: any;

  canyaContract: any = null;
  daoContract: any = null;

  netType: NetworkType;
  walletType: WalletType;

  public web3Status = new BehaviorSubject<Web3LoadingStatus>(Web3LoadingStatus.loading);
  public web3Status$ = this.web3Status.asObservable();

  public account = new BehaviorSubject<string>(null);
  public account$ = this.account.asObservable();

  constructor() {
    if (typeof web3 !== 'undefined') {
      this.web3js = new Web3(web3.currentProvider);
      this.setWalletType();
      try {
        this.web3js.eth.net.getId().then((id: number) => {
          console.log('Web3Service: Network retrieved: ID= ' + id);
          switch (id) {
            case 1:
              this.netType = NetworkType.main;
              this.setUpAccounts();
              return;
            case 3:
              this.netType = NetworkType.ropsten;
              this.setUpAccounts();
              return;
            case 4:
              this.netType = NetworkType.rinkeby;
              this.setUpAccounts();
              return;
            default:
              this.netType = NetworkType.unknown;
              this.setUpAccounts();
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

  private setUpAccounts() {
    if ((environment.contracts.useTestNet && (this.netType === NetworkType.rinkeby || this.netType === NetworkType.ropsten || this.netType === NetworkType.unknown))
      || (!environment.contracts.useTestNet && this.netType === NetworkType.main)) {
      this.canyaContract = new this.web3js.eth.Contract(canyaAbi, environment.contracts.canYaCoin);
      this.daoContract = new this.web3js.eth.Contract(daoAbi, environment.contracts.canYaDao);
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
        }, 5000);
      });
    } else {
      this.web3Status.next(Web3LoadingStatus.wrongNetwork);
    }
  }

  private setWalletType() {
    if (this.web3js.currentProvider.isMetaMask) {
      this.walletType = WalletType.metaMask;
    } else if (this.web3js.currentProvider.isTrust) {
      this.walletType = WalletType.trust;
    } else {
      this.walletType = null;
    }
  }

  private checkAccountMetaMask() {
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

  async providerHasBeenAccepted(addr: string): Promise<boolean> {
    const isProvider = await this.daoContract.methods.isProvider(addr).call();
    return Promise.resolve(isProvider);
  }

  async getProviderBadge(addr: string): Promise<string> {
    const badge = await this.daoContract.methods.getProviderBadge(addr).call();
    if (this.web3js.utils.isHex(badge)) {
      return Promise.resolve(this.web3js.utils.hexToAscii(badge));
    }
    return Promise.resolve(null);
  }

  async providerHasBeenRejected(addr: string): Promise<boolean> {
    const isRejected = await this.daoContract.methods.isRejected(addr).call();
    return Promise.resolve(isRejected);
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

  async buyCoffee(recipient: string, numberOfCan: number): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.canyaContract.methods.transfer(recipient, numberOfCan * (10 ** canDecimals)).send({ from: this.account.value, ...gas });
        resolve(true);
      } catch (error) {
        reject(error);
      }
    }) as Promise<boolean>;
  }

  payCan(recipient: string, amountInEth: number) {
    const transaction = {
      gasLimit: 48000,
      gasPrice: '0x04e3b29200',
      to: environment.contracts.canYaCoin,
      data: this.canyaContract.methods.transfer(recipient, this.web3js.utils.toWei(amountInEth.toString(), 'ether')).encodeABI(),
      value: '0x0'
    };
    return Observable.fromPromise(this.web3js.eth.sendTransaction(transaction));
  }
}
