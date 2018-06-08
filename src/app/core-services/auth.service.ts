import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import 'rxjs/add/operator/take';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { environment } from '../../environments/environment';
import { Avatar, User } from '../core-classes/user';
import { UserService } from './user.service';

@Injectable()
export class AuthService {

  currentUser: User = JSON.parse(localStorage.getItem('credentials'));

  uport: any = null;


  constructor(private afs: AngularFirestore, private afAuth: AngularFireAuth,
    private userService: UserService, private router: Router) {
  }

  getCurrentUser(): Promise<User> {
    this.currentUser = JSON.parse(localStorage.getItem('credentials'));
    if (this.currentUser) {
      // return this.userService.getUser(this.currentUser.address);
      return Promise.resolve(this.currentUser);
    }
    return Promise.reject(null);
  }

  isAuthenticated() {
    return this.currentUser !== null;
  }

  logout() {
    localStorage.clear();
    this.afAuth.auth.signOut();
    this.router.navigate(['home']);
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
