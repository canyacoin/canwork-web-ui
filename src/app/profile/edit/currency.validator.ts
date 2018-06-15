import { FormControl } from '@angular/forms';

export class CurrencyValidator {
  static isValid(control: FormControl) {
    const re: any = /^\d{1,3}(?:\.\d{1,2})?$/.test(control.value);
    if (re) {
      return null;
    }
    return { 'invalidEmail': true };
  }
}
