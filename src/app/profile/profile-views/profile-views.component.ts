import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFirestore } from 'angularfire2/firestore';

import * as moment from 'moment';
import { User } from '../../core-classes/user';

@Component({
  selector: 'app-profile-views',
  templateUrl: './profile-views.component.html',
  styleUrls: ['./profile-views.component.css']
})
export class ProfileViewsComponent implements OnInit {

  currentUser: User = JSON.parse(localStorage.getItem('credentials'));

  users: any = [];
  loading = true;

  constructor(private router: Router,
    private afs: AngularFirestore) {
  }

  ngOnInit() {
    this.afs.collection(`who/${this.currentUser.address}/user`, ref => ref.limit(50).orderBy('timestamp')).valueChanges().take(1).subscribe((data: any) => {
      this.loading = false;
      data.map((item) => {
        item['humanisedDate'] = moment(item.timestamp, 'x').fromNow();
      });
      this.users = data;
    });
  }

}
