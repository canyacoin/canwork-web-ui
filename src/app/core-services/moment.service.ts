import { Injectable } from '@angular/core';

import * as moment from 'moment';

@Injectable()
export class MomentService {

  constructor() { }


  get(date = null, format: string = 'x'): string {
    if (date != null) {
      return moment(date).format(format);
    } else {
      return moment().format(format);
    }
  }
}
