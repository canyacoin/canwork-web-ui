import { Injectable } from '@angular/core'
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanLoad,
  Route,
  Router,
  RouterStateSnapshot,
} from '@angular/router'
import { Observable } from 'rxjs'

import { AuthService } from '../core-services/auth.service'

@Injectable()
export class AuthGuard implements CanActivate, CanLoad {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // additional protection for admin routes, in addition to canLoad on global module
    if ((state.url.startsWith("/admin/")) && !this.authService.isAdmin()) {
      this.router.navigate(['home'])
      return false
    }
      
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
    this.router.navigate(['home'])
    return false
  }
  
  // admin routes are not even loaded, this is secure
  canLoad(
    route: Route
  ): boolean {
    const isAdmin = this.authService.isAdmin()
    if (isAdmin) return true
    
    // not authorized
    this.router.navigate(['home'])    
    return false
  }
}
