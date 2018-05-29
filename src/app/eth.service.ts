import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/share';

import Web3 from 'web3';

declare let require: any;

const canyaAbi = require('./canyaABI.json');

// '0x5a5cd21144943b9e27c9fe3d30adc6fc25c08563';
const canyaContractAddress = '0x1d462414fe14cf489c7A21CaC78509f4bF8CD7c0';

@Injectable()
export class EthService {

  // Web3
  account: string = null;
  web3: any = null;
  canyaContract: any = null;

  // Flags
  // isMetaMaskAvailable = false;
  // isRopstenNetAvailable = false;
  // isWalletUnlocked = false;
  // netId = -1;

  // txObservable: Observable<any> = null;
  // txObserver: Observer<any> = null;

  web3InitObservable: Observable<any> = null;
  web3InitObserver: Observer<any> = null;

  constructor() {
    // this.txObservable = new Observable( (pobserver) => {
    //   this.txObserver = pobserver;
    // }).share();
    // this.txObservable.subscribe();

    this.web3InitObservable = new Observable((wobserver) => {
      this.web3InitObserver = wobserver;
    }).share();
    this.web3InitObservable.subscribe();

    // console.log('EthService - constructor', this.web3InitObservable);
    // this.initWeb3();
  }

  async initWeb3() {
    try {
      if (typeof (<any>window).web3 !== 'undefined') {
        this.web3 = new Web3((<any>window).web3.currentProvider);

        this.web3InitObserver.next({ isMetaMaskAvailable: this.web3.currentProvider.isMetaMask, isWalletUnlocked: false, netId: -1 });

        this.web3.eth.net.getId().then(async (netId) => {
          if (netId !== 1) {
            this.web3InitObserver.next({ isMetaMaskAvailable: this.web3.currentProvider.isMetaMask, isWalletUnlocked: false, netId: netId });
          } else {
            this.web3.eth.getAccounts(async (err, accs) => {
              if (err === null && accs.length > 0) {
                this.account = (accs[0]);
                this.web3.eth.defaultAccount = this.account;

                console.log('EthService - account', this.account, 'isWalletUnlocked', this.account ? true : false);
                this.web3InitObserver.next({ isMetaMaskAvailable: this.web3.currentProvider.isMetaMask, isWalletUnlocked: this.account ? true : false, netId: netId });
              } else {
                this.web3InitObserver.next({ isMetaMaskAvailable: this.web3.currentProvider.isMetaMask, isWalletUnlocked: false, netId: netId });
              }
            });
            this.canyaContract = new this.web3.eth.Contract(canyaAbi, canyaContractAddress);
            console.log('EthService - contract', this.canyaContract);
            // const balance = await this.canyaContract.methods.balanceOf( this.account ).call();
            // console.log('EthService - balance', balance);
          }
        });
      } else {
        setTimeout( () => {
          console.log('Please use a dapp browser like mist or MetaMask plugin for chrome');
          this.web3InitObserver.next({ isMetaMaskAvailable: false, isWalletUnlocked: false, netId: -1 });
        }, 2000);
      }
    } catch (error) {
      console.error('initWeb3 - error', error);
    }
  }

  async buyCOFFEE(toAddress: string, amount: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const transaction = {
        gasLimit: 48000,
        gasPrice: '0x04e3b29200',
        to: canyaContractAddress,
        data: this.canyaContract.methods.transfer(toAddress, this.web3.utils.toWei(amount.toString(), 'ether')).encodeABI(),
        value: '0x0'
      };

      this.web3.eth.sendTransaction(transaction).on('transactionHash', (hash) => {
        console.log('EthService - hash', hash);
        resolve(hash);
      }).on('receipt', (receipt) => {
        console.log('EthService - receipt', receipt);
      }).on('confirmation', (confirmationNumber, receipt) => {
        console.log('EthService - confirmationNumber', confirmationNumber, receipt);
      }).on('error', (error, receipt) => {
        console.log('EthService - error', error, receipt);
        reject(error);
      });
    }) as Promise<string>;
  }

  async getBalance() {
    return new Promise(async (resolve, reject) => {
      try {
        if ( this.account ) {
          const balance = await this.canyaContract.methods.balanceOf(this.account).call();
          // const total = this.web3.utils.toBN(this.web3.utils.toWei(balance + '0', 'wei'));
          // this.web3.utils.fromWei(balance.toString(), 'gwei')
          const t = this.web3.utils.toBN(balance);

          // console.warn('getBalance - t',  );

          resolve( t.div(this.web3.utils.toBN(1000000)).toString() );
        } else {
          // this.web3.utils.fromWei(0 + '', 'gwei')
          resolve('0.00');
        }
      } catch (error) {
        console.error('getBalance - error', error);
        reject(error);
      }
    }) as Promise<string>;
  }

  async getBalanceBN() {
    return new Promise(async (resolve, reject) => {
      try {
        if ( this.account ) {
          const balance = await this.canyaContract.methods.balanceOf(this.account).call();
          resolve( this.web3.utils.toBN(balance.toString()) );
        } else {
          resolve( this.web3.utils.toBN(0) );
        }
      } catch (error) {
        console.error('getBalance - error', error);
        reject(error);
      }
    }) as Promise<string>;
  }

  buyCAN() {
    const transaction = {
      gasLimit: 48000,
      to: canyaContractAddress,
      data: '0x',
      value: this.web3.utils.toWei('0.1', 'ether')
    };
    this.web3.eth.sendTransaction(transaction).on('transactionHash', (hash) => {
      console.log('EthService - hash', hash);
    }).on('receipt', (receipt) => {
      console.log('EthService - receipt', receipt);
    }).on('confirmation', (confirmationNumber, receipt) => {
      console.log('EthService - confirmationNumber', confirmationNumber, receipt);
    }).on('error', (error, receipt) => {
      console.log('EthService - error', error, receipt);
    });
  }

  payCAN(amount: number) {
    const transaction = {
      gasLimit: 48000,
      gasPrice: '0x04e3b29200',
      to: canyaContractAddress,
      data: this.canyaContract.methods.transfer(this.account, this.web3.utils.toWei(amount.toString(), 'ether')).encodeABI(),
      value: '0x0'
    };
    return Observable.fromPromise(this.web3.eth.sendTransaction(transaction));

    // this.web3.eth.sendTransaction(transaction).on('transactionHash', (hash) => {
    //   console.log('EthService - hash', hash);
    //   this.txObserver.next( { hash: hash } );
    // }).on('receipt', (receipt) => {
    //   console.log('EthService - receipt', receipt);
    //   this.txObserver.next( { receipt: receipt } );
    // }).on('confirmation', (confirmationNumber, receipt) => {
    //   console.log('EthService - confirmationNumber', confirmationNumber, receipt);
    //   this.txObserver.next( { confirmationNumber: confirmationNumber, receipt: receipt } );
    // }).on('error', (error, receipt) => {
    //   console.log('EthService - error', error, receipt);
    //   this.txObserver.next( { error: error, receipt: receipt } );
    // });
  }

}
