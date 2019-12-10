import { FormControl } from '@angular/forms'
import { User } from '@class/user'
import { UserService } from '@service/user.service'
import { BinanceService } from '@service/binance.service'

export class BinanceValidator {
  constructor(
    private binanceService: BinanceService,
    private userService: UserService
  ) {}

  isValidAddress = async (address: string) => {
    const resp = await this.binanceService.client.getAccount(address)
    return resp && resp.status === 200
  }

  isValidAddressField = async (control: FormControl) => {
    const { value } = control
    if (value === null) {
      return null
    }

    if (await this.isValidAddress(value)) {
      return null
    }

    return { isInvalidAddress: true }
  }

  async isUniqueAddress(address: string, user: User) {
    const _user = await this.userService.getUserByBnbAddress(address)
    return _user === null || _user.slug === user.slug
  }

  isUniqueAddressField(user: User) {
    return async (control: FormControl) => {
      if (control.value === null) {
        return null
      }

      return !(await this.isUniqueAddress(control.value, user))
        ? { addressExists: true }
        : null
    }
  }
}
