import { Injectable } from '@angular/core'
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Route,
  UrlTree,
} from '@angular/router'
import { AuthService } from '@service/auth.service'
import { User } from '@class/user'

@Injectable({
  providedIn: 'root',
})
export class AdminAuthService {
  currentUser: User

  constructor(private router: Router, private authService: AuthService) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    try {
      this.currentUser = await this.authService.getCurrentUser()
    } catch (e) {}

    const isAdmin = this.currentUser?.isAdmin // configured into backend

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
