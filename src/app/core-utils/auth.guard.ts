import { Injectable } from '@angular/core'
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router'
import { Observable } from 'rxjs'

import { AuthService } from '../core-services/auth.service'

@Injectable()
export class AuthGuard {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (!route.data.requiresLoggedIn && !route.data.requiresLoggedOut) {
      return true
    }
    const isAuthenticated = this.authService.isAuthenticated()
    if (route.data.requiresLoggedIn && isAuthenticated) {
      return true
    } else if (route.data.requiresLoggedOut && !isAuthenticated) {
      return true
    } else if (route.data.requiresLoggedIn && !isAuthenticated) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: state.url },
      })
      return false
    }
    if (route.queryParams['returnUrl']) {
      if (route.queryParams['nextAction'])
        this.router.navigate([route.queryParams['returnUrl']], {
          queryParams: { nextAction: route.queryParams['nextAction'] },
        })
      else this.router.navigate([route.queryParams['returnUrl']])
    } else {
      this.router.navigate(['home'])
    }
    return false
  }
}
