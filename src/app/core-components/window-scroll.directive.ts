import { Directive, Input, NgZone, OnDestroy, OnInit } from '@angular/core'

import { NavService } from '../core-services/nav.service'

@Directive({
  selector: '[appWindowScroll]',
})
export class WindowScrollDirective implements OnInit, OnDestroy {
  @Input() appWindowScroll

  private eventOptions: boolean | { capture?: boolean; passive?: boolean }

  constructor(private ngZone: NgZone, private navService: NavService) {}

  passiveSupported() {
    let passiveSupported = false

    try {
      /*
      // todo check if this is needed, it is not typescript ready with new ts and ng versions
      const options = Object.defineProperty({}, 'passive', {
        get: function () {
          passiveSupported = true
        },
      })

      window.addEventListener('test', options, options)
      window.removeEventListener('test', options, options)*/
      return true
    } catch (err) {
      return false
    }
  }

  ngOnInit() {
    if (this.passiveSupported()) {
      this.eventOptions = {
        capture: true,
        passive: true,
      }
    } else {
      this.eventOptions = true
    }
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.scroll, <any>this.eventOptions)
    })
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.scroll, <any>this.eventOptions)
  }

  scroll = (): void => {
    const doc = document.documentElement
    const top = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0)
    if (top > 20) {
      this.ngZone.run(() => {
        this.navService.setHideSearchBar(false)
      })
    } else {
      this.ngZone.run(() => {
        this.navService.setHideSearchBar(true)
      })
    }
  }
}
