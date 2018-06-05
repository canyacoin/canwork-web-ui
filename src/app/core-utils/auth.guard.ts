import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { AuthService } from '../core-services/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const isAuthenticated = this.authService.isAuthenticated();
    if (isAuthenticated && route.data.canAccessWhenLoggedIn) {
      return true;
    } else if (!isAuthenticated && route.data.canAccessWhenLoggedOut) {
      return true;
    }

    this.router.navigate(['/home']);
    return false;
  }
}
