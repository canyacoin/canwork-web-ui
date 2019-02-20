import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'commaSepNum'
})
export class CommaSepNumPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    if (typeof Intl !== 'object' || typeof Intl.NumberFormat !== 'function') {
      return '0';
    }

    return value ? value.toLocaleString('en-EN', { maximumFractionDigits: 6 }) : '0';
  }
}
