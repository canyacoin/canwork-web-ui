import { FormControl } from '@angular/forms';
import { User } from '@class/user';
import { AngularFirestoreCollection } from 'angularfire2/firestore';

declare let require: any;
const Web3 = require('web3');

export class EthereumValidator {
  static isValidAddress(control: FormControl) {
    if (Web3.utils.isAddress(control.value)) {
      return null;
    }

    return {
      isInvalidEthereumAddress: true
    };
  }

  static isUniqueAddress(usersCollection: AngularFirestoreCollection<any>, user: User) {
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
