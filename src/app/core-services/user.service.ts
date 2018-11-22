import { Injectable } from '@angular/core';
import { Job } from '@class/job';
import { IJobAction } from '@class/job-action';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { take } from 'rxjs/operators';

import * as moment from 'moment-timezone';
import { User, UserType } from '../core-classes/user';

@Injectable()
export class UserService {


  usersCollectionRef: AngularFirestoreCollection<any>;
  viewedUsersRef: AngularFirestoreCollection<any>;

  constructor(private afs: AngularFirestore) {
    this.usersCollectionRef = this.afs.collection<any>('users');
    this.viewedUsersRef = this.afs.collection<any>('viewed-users');
  }

  saveProfileView(viewer: User, viewed: string) {
    const ref = this.afs.doc(`who/${viewed}/user/${viewer.address}`);
    ref.snapshotChanges().pipe(take(1)).toPromise().then((snap: any) => {
      const tmpModel = viewer;
      tmpModel['timestamp'] = moment().format('x');
      return snap.payload.exists ? ref.update(this.parseUserToObject(tmpModel)) : ref.set(this.parseUserToObject(tmpModel));
    });
  }

  addToViewedUsers(viewer: string, viewed: User) {
    const ref = this.afs.collection('viewed-users').doc(viewer).collection('viewed').doc(viewed.address);
    const tmpModel = {
      address: viewed.address,
      timestamp: moment().format('x')
    };
    ref.set(tmpModel);
  }

  async getViewedUsers(viewer: string) {
    const collection = this.afs.collection(`viewed-users/${viewer}/viewed`, ref => ref.orderBy('timestamp', 'desc'));
    return new Promise<any>((resolve, reject) => {
      collection.valueChanges().pipe(take(1)).subscribe((result) => {
        if (result) {
          resolve(result);
        }
        reject();
      });
    });
  }

  async getUser(address: string): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      this.usersCollectionRef.doc(address).valueChanges().pipe(take(1)).subscribe((user: User) => {
        if (user) {
          if (user.timezone) {
            user.offset = moment.tz(user.timezone).format('Z');
          }
          resolve(new User(user));
        } else {
          resolve(undefined);
        }
        reject();
      });
    });
  }

  async getUserByEthAddress(address: string) {
    const data = await this.usersCollectionRef.ref
      .where('ethAddressLookup', '==', address.toUpperCase())
      .limit(1).get();
    return data;
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

  resetUser(userModel: User): Promise<boolean> {
    return new Promise(async (resolve: any, reject: any) => {
      try {
        const sanitizedUser = userModel;
        sanitizedUser.type = null;
        sanitizedUser.whitelisted = false;
        sanitizedUser.whitelistRejected = false;
        sanitizedUser.whitelistSubmitted = false;
        sanitizedUser.work = null;
        sanitizedUser.title = null;
        sanitizedUser.bio = null;
        sanitizedUser.description = null;
        sanitizedUser.category = null;
        sanitizedUser.skillTags = [];
        sanitizedUser.hourlyRate = null;
        sanitizedUser.timestamp = moment().format('x');
        this.usersCollectionRef.doc(sanitizedUser.address).set(this.parseUserToObject(sanitizedUser)).then(() => {
          resolve(true);
        });
      } catch (error) {
        reject(false);
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
      this.usersCollectionRef.doc(ref).snapshotChanges().pipe(take(1)).subscribe((snap: any) => {
        console.log('saveUser - payload', snap.payload.exists);
        return snap.payload.exists ? this.usersCollectionRef.doc(ref).update(this.parseUserToObject(userModel)) : this.usersCollectionRef.doc(ref).set(this.parseUserToObject(userModel));
      });
    }
  }

  /** User object must be re-assigned as firebase doesn't accept strong types */
  private parseUserToObject(user: User): object {
    const parsedRating = Object.assign({}, user.rating);
    const parsedUser = Object.assign({}, user);
    parsedUser.rating = parsedRating;
    return parsedUser;
  }
}
