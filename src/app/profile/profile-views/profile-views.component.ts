import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFirestore } from 'angularfire2/firestore';
import { Subscription } from 'rxjs';

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
        }, error => { console.error('! unable to retrieve who viewed data:', error) });
      }
    }, error => { console.error('! unable to retrieve currentUser data:', error) });
  }

  ngOnDestroy() {
    if (this.authSub) { this.authSub.unsubscribe(); }
  }

}
