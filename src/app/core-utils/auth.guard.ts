import { Injectable } from '@angular/core'
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router'
import { Observable } from 'rxjs'

import { AuthService } from '../core-services/auth.service'

@Injectable()
export class AuthGuard implements CanActivate {
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
      this.router.navigate(['/auth'], {
        queryParams: { returnUrl: state.url },
      })
      return false
    }
    this.router.navigate(['home'])
    return false
  }
}
