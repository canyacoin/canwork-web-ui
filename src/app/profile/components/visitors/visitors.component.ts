import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFirestore } from 'angularfire2/firestore';

import { User } from '../../../core-classes/user';

@Component({
  selector: 'app-profile-visitors',
  templateUrl: './visitors.component.html',
  styleUrls: ['./visitors.component.css']
})
export class VisitorsComponent implements OnInit {

  currentUser: User = JSON.parse(localStorage.getItem('credentials'));
  whoViewProfileCounter = 0;

  constructor(private afs: AngularFirestore) { }

  ngOnInit() {
    const ref = this.afs.collection(`who/${this.currentUser.address}/user`);
    ref.valueChanges().take(1).toPromise().then((data: any) => {
      this.whoViewProfileCounter = data.length;
    });
  }

}
