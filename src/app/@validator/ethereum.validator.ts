import { FormControl, AbstractControl } from '@angular/forms';

declare let require: any
const Web3 = require('web3')

export class EthereumValidator {
  static isValidAddress(control: AbstractControl) {
    if (Web3.utils.isAddress(control.value)) {
      return null
    }

    return {
      isInvalidEthereumAddress: true
    }
  }
}
