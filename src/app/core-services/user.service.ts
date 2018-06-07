import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';

import * as moment from 'moment-timezone';
import { User } from '../core-classes/user';

@Injectable()
export class UserService {

  constructor(private afs: AngularFirestore) { }

  saveProfileView(viewer: User, viewed: string) {
    const ref = this.afs.doc(`who/${viewed}/user/${viewer.address}`);
    ref.snapshotChanges().take(1).toPromise().then((snap: any) => {
      const tmpModel = viewer;
      tmpModel['timestamp'] = moment().format('x');
      return snap.payload.exists ? ref.update(Object.assign({}, tmpModel)) : ref.set(Object.assign({}, tmpModel));
    });
  }

  getUser(address: string): Promise<User> {
    return new Promise((resolve, reject) => {
      this.afs.doc(`users/${address}`).valueChanges().take(1).subscribe((user: User) => {
        if (user) {
          if (user.timezone) {
            user.offset = moment.tz(user.timezone).format('Z');
          }
          resolve(user);
        }
        reject();
      });
    });
  }
}
