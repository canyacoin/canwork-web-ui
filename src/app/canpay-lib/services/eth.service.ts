import { Inject, Injectable, OnDestroy } from '@angular/core';
import { Http, Response } from '@angular/http';
import merge from 'lodash.merge';
import { BehaviorSubject, bindNodeCallback, Observable, Subject, Subscription } from 'rxjs';

declare let require: any;
const Web3 = require('web3');
declare var window;
declare var web3;
declare var ethereum;

const canDecimals = 6;
const gas = { gasPrice: '8000000000', gas: '210000' };
const gasStationApi = 'https://ethgasstation.info/json/ethgasAPI.json';

export enum WalletType {
  metaMask = 'MetaMask',
  trust = 'Trust'
}

export enum NetworkType {
  main = 'Mainnet',
  ropsten = 'Ropsten',
  rinkeby = 'Rinkeby',
  localhost = 'Localhost',
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
  netType: NetworkType;
  walletType: WalletType;
  ownerAccount: string;

  configUseTestNet = false;

  public web3Status = new BehaviorSubject<Web3LoadingStatus>(Web3LoadingStatus.loading);
  public web3Status$ = this.web3Status.asObservable();

  public account = new BehaviorSubject<string>(null);
  public account$ = this.account.asObservable();

  constructor(@Inject('Config') private conf: any = {}, protected http: Http) {
    this.configUseTestNet = this.conf.useTestNet;

    if (window.ethereum || window.web3) {
      if (window.ethereum) {
        this.web3js = new Web3(window.ethereum);
      } else {
        this.web3js = new Web3(web3.currentProvider);
      }

      this.setWalletType();

      try {
        this.web3js.eth.net.getId().then((id: number) => {
          console.log('Web3Service: Network retrieved: ID= ' + id);

          switch (id) {
            case 1:
              this.netType = NetworkType.main;
              break;
            case 3:
              this.netType = NetworkType.ropsten;
              break;
            case 4:
              this.netType = NetworkType.rinkeby;
              break;
            default:
              this.netType = NetworkType.unknown;
          }

          this.setUpAccounts();
        });

      } catch (e) {
        console.log('Web3Service: Error: ID');
        this.web3Status.next(Web3LoadingStatus.error);
      }
    } else {
      this.web3js = new Web3();
      this.web3Status.next(Web3LoadingStatus.noMetaMask);
    }
  }

  ngOnDestroy() {
    if (this.accountInterval) {
      clearInterval(this.accountInterval);
    }
  }

  private setWalletType(): WalletType {
    if (this.web3js.currentProvider.isMetaMask) {
      return this.walletType = WalletType.metaMask;
    }

    if (this.web3js.currentProvider.isTrust) {
      return this.walletType = WalletType.trust;
    }

    return this.walletType = null;
  }

  private setUpAccounts() {
    console.log('setUpAccounts...');
    if ((this.conf.useTestNet && (this.netType === NetworkType.rinkeby
      || this.netType === NetworkType.ropsten || this.netType === NetworkType.unknown))
      || (!this.conf.useTestNet && this.netType === NetworkType.main)) {
      console.log('Web3Service: Is: ', this.netType);
      this.web3js.eth.getAccounts().then((accs: string[]) => {
        console.log('Web3Service: Got accounts: ' + JSON.stringify(accs));
        this.account.next(accs[0]);
        if (accs[0]) {
          this.ownerAccount = accs[0];
          this.web3Status.next(Web3LoadingStatus.complete);
        } else {
          this.web3Status.next(Web3LoadingStatus.noAccountsAvailable);
        }
        this.accountInterval = setInterval(() => this.checkAccountMetaMask(), 5000);
      });

      return;
    }

    this.web3Status.next(Web3LoadingStatus.wrongNetwork);
  }

  private checkAccountMetaMask() {
    this.web3js.eth.getAccounts().then((accs: string[]) => {
      if (accs[0] !== this.account.value) {
        console.log('Web3Service: new account found: ' + JSON.stringify(accs[0]));
        this.account.next(accs[0]);
        if (accs[0] !== undefined) { // && (this.web3Status.value !== Web3LoadingStatus.complete)
          this.ownerAccount = accs[0];
          this.web3Status.next(Web3LoadingStatus.complete);
          return;
        }

        this.web3Status.next(Web3LoadingStatus.noAccountsAvailable);
      }
    });
  }

  async getEthBalanceAsync(userAddress: string = this.getOwnerAccount()): Promise<string> {
    if (userAddress) {
      const balance = await this.web3js.eth.getBalance(userAddress);
      if (balance) {
        console.log(balance);
        const tokens = this.web3js.utils.toBN(balance).toString();
        console.log('Eth Owned: ' + this.web3js.utils.fromWei(tokens, 'ether'));
        return Promise.resolve(this.web3js.utils.fromWei(tokens, 'ether'));
      }
    }


    return Promise.reject(null);
  }

  getOwnerAccount() {
    if (this.web3Status.value === Web3LoadingStatus.noAccountsAvailable) {
      window.ethereum.enable().then(acc => {
        return acc[0];
      }).catch(e => {
        return this.ownerAccount;
      });
    } else {
      return this.ownerAccount;
    }
  }

  getDefaultGasParams() {
    return gas;
  }

  getDefaultGasPriceGwei(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        this.http.get(gasStationApi).toPromise().then(res => {
          if (res.ok) {
            resolve(JSON.parse(res.text())['fast'].toString() + '00000000');
          } else {
            resolve('11000000000');
          }
        }).catch(e => {
          resolve('11000000000');
        });
      } catch (e) {
        resolve('11000000000');
      }
    });
  }

  amountToCANTokens(amount) {
    return this.toBaseUnit(amount, canDecimals, this.web3js.utils.BN);
  }

  amountToERCTokens(amount, decimal): string {
    return this.toBaseUnit(amount, decimal, this.web3js.utils.BN);
  }

  createContractInstance(abi, address) {
    console.log('createContractInstance: ', abi, address);
    if (!this.web3js) {
      console.log('Error createContractInstance, web3 provider not initialized');
      return;
    }
    return new this.web3js.eth.Contract(abi, address);
  }

  async payWithEther(amount: number, to: string): Promise<any> {
    const gasPrice = await this.getDefaultGasPriceGwei();
    const from = this.getOwnerAccount();
    return new Promise((resolve, reject) => {
      this.web3js.eth.sendTransaction({
        to,
        from: from,
        value: this.web3js.utils.toWei(amount.toString(), 'ether'),
        gasPrice: gasPrice
      }, async (err, txHash) => this.resolveTransaction(err, from, txHash, resolve, reject));
    });
  }

  async payWithErc20Token(abi, recipient: string, amount: number, address, decimal, gasPrice): Promise<any> {
    const from = this.getOwnerAccount();
    const contract = this.createContractInstance(abi, address);
    const amountWithDecimals = this.amountToERCTokens(amount, decimal);
    // const amountWithDecimals = 10000000000000000000;


    return new Promise(async (resolve, reject) => {
      const tx = await contract.methods.transfer(recipient, amountWithDecimals);
      let txGas, txGasPrice;
      try {
        txGas = await tx.estimateGas({ from });
        txGasPrice = await this.getDefaultGasPriceGwei();
      } catch (e) {
        reject(e);
      }
      tx.send({ from, gas: txGas, gasPrice: txGasPrice }, async (err, txHash) => this.resolveTransaction(err, from, txHash, resolve, reject));
    });
  }

  async resolveTransaction(err, from, txHash, resolve, reject, onTxHash: Function = null) {
    if (err) {
      reject(err);
    } else {
      try {
        if (onTxHash) {
          onTxHash(txHash, from);
        }
        const receipt = await this.getTransactionReceiptMined(txHash);
        receipt.status = typeof (receipt.status) === 'boolean' ? receipt.status : this.web3js.utils.hexToNumber(receipt.status);
        resolve(receipt);
      } catch (e) {
        reject(e);
      }
    }
  }

  getTransactionReceiptMined(txHash, interval = 500, blockLimit = 0): Promise<any> {
    const transactionReceiptAsync = (resolve, reject) => {
      this.web3js.eth.getTransactionReceipt(txHash, (error, receipt) => {
        if (error) {
          return reject(error);
        }
        if (receipt == null) {
          setTimeout(() => transactionReceiptAsync(resolve, reject), interval);
          return;
        }
        resolve(receipt);
      });
    };

    return new Promise(transactionReceiptAsync);
  }

  isString(s) {
    return (typeof s === 'string' || s instanceof String);
  }

  toBaseUnit(value, decimals, BN): string {
    if (!this.isString(value)) {
      value = value.toString();
    }
    const ten = new BN(10);
    const base = ten.pow(new BN(decimals));

    // Is it negative?
    const negative = (value.substring(0, 1) === '-');
    if (negative) {
      value = value.substring(1);
    }

    if (value === '.') {
      throw new Error(
        `Invalid value ${value} cannot be converted to`
        + ` base unit with ${decimals} decimals.`);
    }

    // Split it into a whole and fractional part
    const comps = value.split('.');
    if (comps.length > 2) { throw new Error('Too many decimal points'); }

    let whole = comps[0], fraction = comps[1];

    if (!whole) { whole = '0'; }
    if (!fraction) { fraction = '0'; }
    if (fraction.length > decimals) {
      throw new Error('Too many decimal places');
    }

    while (fraction.length < decimals) {
      fraction += '0';
    }

    whole = new BN(whole);
    fraction = new BN(fraction);
    let wei = (whole.mul(base)).add(fraction);

    if (negative) {
      wei = wei.mul(-1);
    }

    return new BN(wei.toString(10), 10).toString();
  }
}
