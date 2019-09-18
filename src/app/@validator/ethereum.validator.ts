import { FormControl } from '@angular/forms'
import { User } from '@class/user'
import { EthService } from '@service/eth.service'
import { UserService } from '@service/user.service'

export class EthereumValidator {
  constructor(
    private ethService: EthService,
    private userService: UserService
  ) {}

  isValidAddress = (control: FormControl) => {
    const { value } = control
    return value === null || this.ethService.isAddress(value)
      ? null
      : { isInvalidEthereumAddress: true }
  }

  isUniqueAddress(user: User) {
    return async (control: FormControl) => {
      if (control.value == null) {
        return true
      }

      const users = await this.userService
        .firestoreSelect({
          path: 'users',
          where: [['ethAddressLookup', '==', control.value.toUpperCase()]],
        })
        .toPromise()

      return users.some(item => item.address !== user.address)
        ? { addressExists: true }
        : null
    }
  }
}
