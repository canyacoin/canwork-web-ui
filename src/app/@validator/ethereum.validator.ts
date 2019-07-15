import { FormControl } from '@angular/forms'
import { User } from '@class/user'
import { AngularFirestoreCollection } from 'angularfire2/firestore'
import { EthService } from '@service/eth.service'

export class EthereumValidator {
  constructor(private ethService: EthService) {}

  isValidAddress = (control: FormControl) => {
    return this.ethService.isAddress(control.value)
      ? null
      : { isInvalidEthereumAddress: true }
  }

  isUniqueAddress(
    usersCollection: AngularFirestoreCollection<any>,
    user: User
  ) {
    return async (control: FormControl) => {
      const data = await usersCollection.ref
        .where('ethAddressLookup', '==', control.value.toUpperCase())
        .get()

      return data.docs.some(item => item.get('address') !== user.address)
        ? { addressExists: true }
        : null
    }
  }
}
