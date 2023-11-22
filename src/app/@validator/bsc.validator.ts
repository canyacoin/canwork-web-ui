import { UntypedFormControl } from '@angular/forms'
import { User } from '@class/user'
import { UserService } from '@service/user.service'
import { BscService } from '@service/bsc.service'

export class BscValidator {
  constructor(
    private bscService: BscService,
    private userService: UserService
  ) {}

  async isUniqueAddress(address: string, user: User) {
    if (address === null || address === '') {
      return null
    }
    const _user = await this.userService.getUserByBscAddress(address)
    return _user === null || _user.slug === user.slug
  }

  isUniqueAddressField(user: User) {
    return async (control: UntypedFormControl) => {
      if (control.value === null || control.value === '') {
        return null
      }

      return !(await this.isUniqueAddress(control.value, user))
        ? { addressExists: true }
        : null
    }
  }

  isValidAddress = async (address: string) => {
    return this.bscService.checkAddress(address)
  }

  isValidAddressField = async (control: UntypedFormControl) => {
    const { value } = control
    if (value === null || value === '') {
      return null
    }

    if (await this.isValidAddress(value)) {
      return null
    }

    return { isInvalidAddress: true }
  }
}
