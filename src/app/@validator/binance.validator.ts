import { FormControl } from '@angular/forms'
import { User } from '@class/user'
import { UserService } from '@service/user.service'
import { BinanceService } from '@service/binance.service'

export class BinanceValidator {
  constructor(
    private binanceService: BinanceService,
    private userService: UserService
  ) {}

  isValidAddress = async (control: FormControl) => {
    const { value } = control
    if (value === null) {
      return null
    }

    const resp = await this.binanceService.client.getAccount(value)
    if (resp && resp.status === 200) {
      return null
    }

    return { isInvalidAddress: true }
  }

  isUniqueAddress(user: User) {
    return async (control: FormControl) => {
      if (control.value === null) {
        return true
      }

      const users = await this.userService
        .firestoreSelect({
          path: 'users',
          where: [['bnbAddress', '==', control.value]],
        })
        .toPromise()

      return users.some(item => item.address !== user.address)
        ? { addressExists: true }
        : null
    }
  }
}
