import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import * as firebase from 'firebase/app';
import { Avatar, User } from '../core-classes/user';

@Injectable()
export class AuthService {

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
      this.emitUser(new User(val));
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
}
