import { AuthService } from './../../core-services/auth.service'
import { User } from './../../core-classes/user'
import { providerTypeArray } from './../../const/providerTypes'
import { Component, OnInit, Directive } from '@angular/core'

declare var createCustomFooter: any

@Directive()
@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent implements OnInit {
  currentUser: User
  public providerTypes = providerTypeArray
  private authSub

  constructor(private auth: AuthService) {}

  ngOnInit() {
    this.authSub = this.auth.currentUser$.subscribe((user: User) => {
      if (this.currentUser !== user) {
        this.currentUser = user
      }
    })
  }
}
