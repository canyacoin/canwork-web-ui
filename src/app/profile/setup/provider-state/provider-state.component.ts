import { Component, Input } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'

import { User, UserState } from '../../../core-classes/user'
import { UserService } from '../../../core-services/user.service'

@Component({
  selector: 'app-provider-state',
  templateUrl: './provider-state.component.html',
  styleUrls: ['./provider-state.component.css'],
})
export class ProviderStateComponent {
  @Input() currentUser: User

  returnUrl: string

  loading = false

  constructor(
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.returnUrl = '/'
    if (this.route.snapshot.queryParams['returnUrl']) this.returnUrl = decodeURIComponent(this.route.snapshot.queryParams['returnUrl'])
  }

  finishProviderSetup() {
    this.userService.updateUserProperty(
      this.currentUser,
      'state',
      UserState.done
    )
    this.router.navigateByUrl(this.returnUrl)
  }

  browse() {
    this.router.navigate(['/home'])
  }

  resetUser() {
    this.loading = true
    this.userService.resetUser(this.currentUser)
  }
}
