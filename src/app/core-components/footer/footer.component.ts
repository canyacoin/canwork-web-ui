import { Component, OnInit, OnDestroy } from '@angular/core'
import { AuthService } from './../../core-services/auth.service'
import { User } from './../../core-classes/user'
import { Subscription } from 'rxjs'
import { Router } from '@angular/router'
import { FooterService } from 'app/shared/constants/footer'

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
})
export class FooterComponent implements OnInit, OnDestroy {
  footerSection = FooterService
  currentUser: User | undefined
  private authSub: Subscription | undefined

  constructor(private auth: AuthService, private router: Router) {}

  submitSearchQuery(value: string) {
    if (value)
      this.router.navigate(['search'], {
        queryParams: { query: value },
      })
  }

  ngOnInit() {
    this.authSub = this.auth.currentUser$.subscribe((user: User) => {
      if (this.currentUser !== user) {
        this.currentUser = user
      }
    })
  }

  ngOnDestroy() {
    // Unsubscribe to avoid memory leaks
    if (this.authSub) {
      this.authSub.unsubscribe()
    }
  }
}
