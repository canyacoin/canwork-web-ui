import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { AuthService } from '../core-services/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (route.data.requiresLoggedIn || route.data.requiresLoggedOut) {
      return true;
    }
    const isAuthenticated = this.authService.isAuthenticated();
    if (route.data.requiresLoggedIn && isAuthenticated) {
      return true;
    } else if (route.data.requiresLoggedOut && !isAuthenticated) {
      return true;
    }

    this.router.navigate(['/home']);
    return false;
  }
}
