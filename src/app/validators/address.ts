import {FormControl} from '@angular/forms';

import Web3 from 'web3';

export class EthAddressValidator {

  static isValid(control: FormControl) {
    const web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/XK1wLa9Qe4yFtT25eG9l'));
    return web3.utils.isAddress( control.value ) ? null : {'invalidAddress': true};
  }
}
