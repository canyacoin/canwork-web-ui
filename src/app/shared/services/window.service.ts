import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class WindowService {
  private windowWidthSubject = new BehaviorSubject<number>(window.innerWidth)
  private scrollYSubject = new BehaviorSubject<number>(window.scrollY)

  constructor() {
    window.addEventListener('resize', () => {
      this.windowWidthSubject.next(window.innerWidth)
    })

    window.addEventListener('scroll', () => {
      this.scrollYSubject.next(window.scrollY)
    })
  }

  getWindowWidth() {
    return this.windowWidthSubject.asObservable()
  }

  getScrollY() {
    return this.scrollYSubject.asObservable()
  }
}
