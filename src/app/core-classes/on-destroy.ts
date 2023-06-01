import { Injectable } from '@angular/core'

import { OnDestroy } from '@angular/core'
import { Subject } from 'rxjs'

@Injectable()
export abstract class OnDestroyComponent implements OnDestroy {
  destroy$ = new Subject()
  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
