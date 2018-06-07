import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { User, UserState } from '../core-classes/user';
import { AuthService } from '../core-services/auth.service';

@Injectable()
export class UserIsSetupGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    this.authService.getCurrentUser().then((user: User) => {
      if (user) {
        if (user.state === UserState.done) {
          return true;
        } else {
          this.router.navigate(['/profile/edit']);
          return false;
        }
      }
    });
    return false;
  }
}
