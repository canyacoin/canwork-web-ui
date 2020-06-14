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
    // only for route /admin/create check into db if there admins
    // if not (first setup) let it load
    // for all other /admin/* routes, simply check if user is admin
    // TODO add to user properties admin: boolean and ethAddress: string
    console.log('called canLoad')
    
    // not authorized
    this.router.navigate(['home'])    
    return false
  }
}
