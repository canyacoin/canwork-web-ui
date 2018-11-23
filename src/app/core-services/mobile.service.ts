import { WINDOW } from '@ng-toolkit/universal';
import { Injectable, Inject } from '@angular/core';

@Injectable()
export class MobileService {
  // ===================================================
  //    A service to handle mobile-specific queries.
  // ===================================================
  isOnMobile = false;
  userAgent;
  constructor(@Inject(WINDOW) private window: Window, ) {
    this.userAgent = window.navigator.userAgent;
    this.isOnMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(this.userAgent);
  }

  get onMobile() {
    return this.isOnMobile;
  }
}
