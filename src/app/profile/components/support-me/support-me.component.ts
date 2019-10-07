import { Component, Input } from '@angular/core'
import { Router } from '@angular/router'
import {
  CanPayData,
  CanPayService,
  Operation,
  ProcessAction,
  setProcessResult,
  View,
} from '@canpay-lib/lib'
import { User } from '@class/user'
import { EthService } from '@service/eth.service'
import {
  FeatureToggle,
  FeatureToggleService,
} from '@service/feature-toggle.service'

@Component({
  selector: 'app-profile-support-me',
  templateUrl: './support-me.component.html',
  styleUrls: ['./support-me.component.css'],
})
export class SupportMeComponent {
  @Input() userModel: User
  @Input() currentUser: User

  constructor(private router: Router) {}

  onBuyACoffee() {
    this.router.navigate(['/profile/buy-coffee', this.userModel.address])
  }
}
