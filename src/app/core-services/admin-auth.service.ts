import { Injectable } from '@angular/core'
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Route,
  UrlTree,
} from '@angular/router'

@Injectable({
  providedIn: 'root',
})
export class AdminAuthService {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const isAdmin = false // debug, todo

    // provides the route configuration options.
    const { routeConfig } = route

    // provides the path of the route.
    const { path } = routeConfig as Route

    if (path?.includes('admin')) {
      // if user is administrator and is trying to access admin routes, allow access.
      if (isAdmin) return true

      // otherwise deny
      this.router.navigate(['/home'])

      return false
    }

    return true // default allow
  }
}
