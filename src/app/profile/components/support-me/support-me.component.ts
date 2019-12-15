import { Component, Input } from '@angular/core'
import { Router } from '@angular/router'
import { User } from '@class/user'

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
