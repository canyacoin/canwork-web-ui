import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/take';

import { MomentService } from './moment.service';

import { environment } from '../../environments/environment';


@Injectable()
export class AuthService {

  currentUser: any = JSON.parse(localStorage.getItem('credentials'));

  uport: any = null;
  web3: any = null;

  usersCollectionRef: AngularFirestoreCollection<any>;

  constructor(private afs: AngularFirestore, private moment: MomentService) {
    this.initUport();
    this.usersCollectionRef = this.afs.collection<any>('users');
  }

  // TODO: Refactor this into the thing called in auth guard (getCurrentUser)
  getCurrentUser() {
    this.currentUser = JSON.parse(localStorage.getItem('credentials'));
    console.log('getCurrentUser - currentUser', this.currentUser, this.currentUser.address);
    if (this.currentUser && this.currentUser.address) {
      // Firebase: GetUser
      return this.afs.collection<any>('users').doc(this.currentUser.address).valueChanges().take(1);
    }
    return null;
  }

  isAuthenticated() {
    return this.currentUser !== null;
  }

  initUport() {
    try {
      this.uport = new (<any>window).uportconnect.Connect('canya.com', {
        clientId: environment.uPort.clientId,
        signer: (<any>window).uportconnect.SimpleSigner(environment.uPort.signer)
      });
      this.web3 = this.uport.getWeb3();
    } catch (error) {
      console.error('UserService\t initUport\t error', error);
    }
  }


  // formerly connect
  async uportConnectAsync(type?: string) {
    return new Promise((resolve: any, reject: any) => {
      this.uport.requestCredentials({
        requested: ['avatar', 'name', 'email', 'phone', 'country'],
        notifications: true // We want this if we want to receive credentials
      }).then(async (credentials) => {
        this.initialiseUser(credentials, type).then( (user: any) => {
          resolve(user);
        }, (error) => {
          reject(error);
        });
      }, (error) => {
        reject(error);
      });
    });
  }

  // Formerly saveCredentials
  initialiseUser(credentials: any, type?: string): Promise<any> {
    return new Promise(async (resolve: any, reject: any) => {
      try {
        credentials['timestamp'] = this.moment.get();
        localStorage.setItem('credentials', JSON.stringify(credentials));
        this.saveUserFirebase(credentials);
        resolve(credentials);
      } catch (error) {
        reject(error);
      }
    });
  }

  // formerly saveData
  updateUserProperty(key: string, value: any) {
    const credentials = JSON.parse(localStorage.getItem('credentials'));
    if (credentials) {
      credentials[key] = value;
      localStorage.setItem('credentials', JSON.stringify(credentials));
      this.saveUserFirebase(credentials);
    }
  }

  private saveUserFirebase(userModel: any) {
    if (userModel && userModel.address) {
      const ref = userModel.address;
      // Firebase: SaveUser
      this.usersCollectionRef.doc(ref).snapshotChanges().take(1).subscribe((snap: any) => {
        console.log('saveUser - payload', snap.payload.exists);
        return snap.payload.exists ? this.usersCollectionRef.doc(ref).update(userModel) : this.usersCollectionRef.doc(ref).set(userModel);
      });
    }
  }
}
