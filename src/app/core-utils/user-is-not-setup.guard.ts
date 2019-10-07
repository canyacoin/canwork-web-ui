import { Injectable } from '@angular/core'
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router'
import { Observable } from 'rxjs'

import { User, UserState } from '../core-classes/user'
import { AuthService } from '../core-services/auth.service'

@Injectable()
export class UserIsNotSetupGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.authService
        .getCurrentUser()
        .then((user: User) => {
          if (user) {
            if (user.state !== UserState.done) {
              resolve(true)
            }
          } else {
            this.router.navigate(['/auth'])
          }
          resolve(false)
        })
        .catch(err => {
          resolve(false)
        })
    })
  }
}
