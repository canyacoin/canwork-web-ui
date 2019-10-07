import { Injectable } from '@angular/core'

@Injectable()
export class MobileService {
  // ===================================================
  //    A service to handle mobile-specific queries.
  // ===================================================
  isOnMobile = false
  userAgent = window.navigator.userAgent
  constructor() {
    this.isOnMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(
      this.userAgent
    )
  }

  get onMobile() {
    return this.isOnMobile
  }
}
