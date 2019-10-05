import { OnDestroy } from '@angular/core'
import { Subject } from 'rxjs'

export abstract class OnDestroyComponent implements OnDestroy {
  destroy$ = new Subject()
  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
