import { FormControl } from '@angular/forms'
import { User } from '@class/user'
import { AngularFirestoreCollection } from 'angularfire2/firestore'
import { EthService } from '@service/eth.service'

export class EthereumValidator {
  constructor(private ethService: EthService) {}

  isValidAddress = (control: FormControl) => {
    const { value } = control
    return value === null || this.ethService.isAddress(value)
      ? null
      : { isInvalidEthereumAddress: true }
  }

  isUniqueAddress(
    usersCollection: AngularFirestoreCollection<any>,
    user: User
  ) {
    return async (control: FormControl) => {
      if (control.value == null) {
        return true
      }
      const data = await usersCollection.ref
        .where('ethAddressLookup', '==', control.value.toUpperCase())
        .get()

      return data.docs.some(item => item.get('address') !== user.address)
        ? { addressExists: true }
        : null
    }
  }
}
