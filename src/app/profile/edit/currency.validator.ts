import { FormControl } from '@angular/forms';

export class CurrencyValidator {
  static isValid(control: FormControl) {
    const re: any = /[0-9]?[0-9]?[0-9]?(\.[0-9][0-9]?)?/.test(control.value);
    if (re) {
      return null;
    }
    return { 'invalidEmail': true };
  }
}
