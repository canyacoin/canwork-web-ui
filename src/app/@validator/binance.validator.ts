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
    return this.binanceService.checkAddress(address)
  }

  isValidAddressField = async (control: FormControl) => {
    const { value } = control
    if (value === null || value === '') {
      return null
    }

    if (await this.isValidAddress(value)) {
      return null
    }

    return { isInvalidAddress: true }
  }

  async isUniqueAddress(address: string, user: User) {
    if (address === null || address === '') {
      return null
    }
    const _user = await this.userService.getUserByBnbAddress(address)
    return _user === null || _user.slug === user.slug
  }

  isUniqueAddressField(user: User) {
    return async (control: FormControl) => {
      if (control.value === null || control.value === '') {
        return null
      }

      return !(await this.isUniqueAddress(control.value, user))
        ? { addressExists: true }
        : null
    }
  }
}
