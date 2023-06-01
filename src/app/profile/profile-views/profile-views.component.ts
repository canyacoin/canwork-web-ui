import { Component, OnDestroy, OnInit, Directive } from '@angular/core'
import { Subscription } from 'rxjs'
import * as moment from 'moment'
import { User } from '../../core-classes/user'
import { AuthService } from '../../core-services/auth.service'
import { AngularFireFunctions } from '@angular/fire/functions'
import { assoc, pipe } from 'ramda'
import { SelectParams } from '../../../../functions/src/firestore'

@Component({
  selector: 'app-profile-views',
  templateUrl: './profile-views.component.html',
  styleUrls: ['./profile-views.component.css'],
})
export class ProfileViewsComponent implements OnInit, OnDestroy {
  currentUser: User
  authSub: Subscription

  users: any = []
  loading = true

  constructor(
    private authService: AuthService,
    private funcs: AngularFireFunctions
  ) {}

  ngOnInit() {
    this.authSub = this.authService.currentUser$.subscribe(
      async (user: User) => {
        this.currentUser = user
        if (this.currentUser) {
          const visitors = await this.funcs
            .httpsCallable<SelectParams, User[]>('firestoreSelect')({
              path: `who/${this.currentUser.address}/user`,
              limit: 50,
              orderBy: ['timestamp', 'asc'],
            })
            .toPromise()

          this.loading = false
          this.users = visitors.map((visitor) =>
            pipe(
              assoc('@type', 'Person'), // hack: see more functions/src/firestore.ts
              assoc('humanisedDate', moment(visitor.timestamp, 'x').fromNow())
            )(visitor)
          )
        }
      },
      (error) => {
        console.error('! unable to retrieve currentUser data:', error)
      }
    )
  }

  ngOnDestroy() {
    if (this.authSub) {
      this.authSub.unsubscribe()
    }
  }
}
