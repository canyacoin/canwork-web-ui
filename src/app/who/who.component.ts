import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AngularFirestore } from 'angularfire2/firestore';

import * as moment from 'moment';

@Component({
  selector: 'app-who',
  templateUrl: './who.component.html',
  styleUrls: ['./who.component.css']
})
export class WhoComponent implements OnInit {

  currentUser: any = JSON.parse( localStorage.getItem('credentials') );

  users: any = [];
  loading = true;

  constructor(private router: Router,
    private afs: AngularFirestore) {

  }

  ngOnInit() {
    this.afs.collection(`who/${this.currentUser.address}/user`, ref => ref.limit(50).orderBy('timestamp')).valueChanges().take(1).subscribe( (data: any) => {
      this.loading = false;
      data.map( (item) => {
        item['humanisedDate'] = moment(item.timestamp, 'x').fromNow();
      });
      this.users = data;
      console.log('WhoComponent', this.users);
    });
  }

}
