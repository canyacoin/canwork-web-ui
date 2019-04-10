import { FormControl } from '@angular/forms';
import { User } from '@class/user';
import { AngularFirestoreCollection } from 'angularfire2/firestore';
import { EthService } from '@service/eth.service';

declare let require: any;
const Web3 = require('web3');

export class EthereumValidator {
  static ethService: EthService;
  constructor(private ethService: EthService) {
    EthereumValidator.ethService = ethService;
  }
  isValidAddress(control: FormControl) {

    if (EthereumValidator.ethService.isAddress(control.value)) {
      return null;
    }

    return {
      isInvalidEthereumAddress: true
    };
  }

  isUniqueAddress(usersCollection: AngularFirestoreCollection<any>, user: User) {
    return async (control: FormControl) => {
      const data = await usersCollection.ref
        .where('ethAddressLookup', '==', control.value.toUpperCase()).get();

      if (data.empty) {
        return null;
      }

      return new Promise((resolve, reject) => {
        data.forEach(record => {

          const addressBelongsToUser: boolean = record.id === user.address &&
            control.value.toUpperCase() === user.ethAddress.toUpperCase();
          // console.log('is ' + control.value.toUpperCase() + '===' + user.ethAddress.toUpperCase() + ' ? ' + addressBelongsToUser);
          if (addressBelongsToUser) {
            resolve(null);
          }

          resolve({
            addressExists: true
          });
        });
      });
    };
  }
}
