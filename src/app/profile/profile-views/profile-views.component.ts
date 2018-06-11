import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFirestore } from 'angularfire2/firestore';
import { Subscription } from 'rxjs/Subscription';

import * as moment from 'moment';
import { User } from '../../core-classes/user';
import { AuthService } from '../../core-services/auth.service';

@Component({
  selector: 'app-profile-views',
  templateUrl: './profile-views.component.html',
  styleUrls: ['./profile-views.component.css']
})
export class ProfileViewsComponent implements OnInit, OnDestroy {

  currentUser: User;
  authSub: Subscription;

  users: any = [];
  loading = true;

  constructor(private router: Router, private authService: AuthService,
    private afs: AngularFirestore) {
  }

  ngOnInit() {
    this.authSub = this.authService.currentUser$.subscribe((user: User) => {
      this.currentUser = user;
      if (this.currentUser) {
        this.afs.collection(`who/${this.currentUser.address}/user`, ref => ref.limit(50).orderBy('timestamp')).valueChanges().take(1).subscribe((data: any) => {
          this.loading = false;
          data.map((item) => {
            item['humanisedDate'] = moment(item.timestamp, 'x').fromNow();
          });
          this.users = data;
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.authSub) { this.authSub.unsubscribe(); }
  }

}
