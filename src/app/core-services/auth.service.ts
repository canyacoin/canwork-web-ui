import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import 'rxjs/add/operator/take';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import * as firebase from 'firebase';
import { environment } from '../../environments/environment';
import { Avatar, User } from '../core-classes/user';

@Injectable()
export class AuthService {

  uport: any = null;

  userSub: Subscription;

  public currentUser = new BehaviorSubject<User>(null);
  public currentUser$ = this.currentUser.asObservable();

  constructor(private afs: AngularFirestore, private afAuth: AngularFireAuth, private router: Router) {
    const savedUser = JSON.parse(localStorage.getItem('credentials'));
    if (savedUser) {
      this.setUser(savedUser);
    }
  }

  getCurrentUser(): Promise<User> {
    if (this.currentUser.value) {
      return Promise.resolve(this.currentUser.value);
    }
    return Promise.reject(null);
  }

  isAuthenticated() {
    return this.currentUser.value !== null;
  }

  // TODO: fix async/promise issue here.
  public async getJwt(): Promise<string> {
    console.log('+ 1 current token:', window.sessionStorage.accessToken);
    await firebase.auth().onAuthStateChanged(async user => {
      if (user) {
        const token = await user.getIdToken(true);
        console.log('+ 2 refreshed token', token);
        return token;
      } else {
        window.sessionStorage.accessToken = '';
      }
    });
    return '';
  }

  setUser(user: User) {
    this.emitUser(user);
    if (this.userSub) { this.userSub.unsubscribe(); }
    this.userSub = this.afs.doc(`users/${user.address}`).valueChanges().subscribe((val: User) => {
      this.emitUser(val);
    });
  }

  emitUser(user: User) {
    localStorage.setItem('credentials', JSON.stringify(user));
    this.currentUser.next(user);
  }

  logout() {
    localStorage.clear();
    this.currentUser.next(null);
    this.afAuth.auth.signOut();
    this.router.navigate(['home']); // TODO: Change this to reload same route - and hit the auth guards again
  }

  initUport() {
    try {
      this.uport = new (<any>window).uportconnect.Connect('canya.com', {
        clientId: environment.uPort.clientId,
        signer: (<any>window).uportconnect.SimpleSigner(environment.uPort.signer)
      });
    } catch (error) {
      console.error('UserService\t initUport\t error', error);
    }
  }

  // formerly connect
  async uportConnectAsync(type?: string): Promise<any> {
    return new Promise((resolve: any, reject: any) => {
      this.uport.requestCredentials({
        requested: ['avatar', 'name', 'email', 'phone', 'country'],
        notifications: true // We want this if we want to receive credentials
      }).then(async (credentials) => {
        console.log(JSON.stringify(credentials));
        resolve(credentials);
      }, (error) => {
        reject(error);
      });
    });
  }
}
