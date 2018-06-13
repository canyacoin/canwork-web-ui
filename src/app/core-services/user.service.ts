import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';

import * as moment from 'moment-timezone';
import { User } from '../core-classes/user';

@Injectable()
export class UserService {


  usersCollectionRef: AngularFirestoreCollection<any>;

  constructor(private afs: AngularFirestore) {
    this.usersCollectionRef = this.afs.collection<any>('users');
  }

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

  saveUser(credentials: User, type?: string): Promise<User> {
    return new Promise(async (resolve: any, reject: any) => {
      try {
        credentials.timestamp = moment().format('x');
        // localStorage.setItem('credentials', JSON.stringify(credentials));
        this.saveUserFirebase(credentials);
        resolve(credentials);
      } catch (error) {
        reject(error);
      }
    });
  }

  updateUserProperty(user: User, key: string, value: any) {
    if (user) {
      user[key] = value;
      // localStorage.setItem('credentials', JSON.stringify(user));
      this.saveUserFirebase(user);
    }
  }

  private saveUserFirebase(userModel: User) {
    if (userModel && userModel.address) {
      const ref = userModel.address;
      // Firebase: SaveUser
      this.usersCollectionRef.doc(ref).snapshotChanges().take(1).subscribe((snap: any) => {
        console.log('saveUser - payload', snap.payload.exists);
        return snap.payload.exists ? this.usersCollectionRef.doc(ref).update(Object.assign({}, userModel)) : this.usersCollectionRef.doc(ref).set(Object.assign({}, userModel));
      });
    }
  }
}