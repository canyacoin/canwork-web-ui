import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { AngularFireAuth } from '@angular/fire/auth'
import { AngularFirestore } from '@angular/fire/firestore'
import { BehaviorSubject, Subscription } from 'rxjs'

import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

import { User } from '../core-classes/user'

@Injectable()
export class AuthService {
  userSub: Subscription

  public currentUser = new BehaviorSubject<User>(null)
  public currentUser$ = this.currentUser.asObservable()

  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private router: Router
  ) {
    const savedUser = JSON.parse(localStorage.getItem('credentials'))
    if (savedUser) {
      this.setUser(savedUser)
    }
  }

  getCurrentUser(): Promise<User> {
    if (this.currentUser.value) {
      return Promise.resolve(this.currentUser.value)
    }
    return Promise.reject(null)
  }

  isAuthenticated() {
    return this.currentUser.value !== null
  }

  async isAuthenticatedAndNoAddress(): Promise<boolean> {
    const user = await this.getCurrentUser()
    return Promise.resolve(!!user && !user.bscAddress)
  }

  async getJwt(): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      await firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
          const token = await user.getIdToken(true)
          resolve(token)
        } else {
          resolve('')
        }
      })
    })
  }

  setUser(user: User) {
    this.emitUser(user)
    if (this.userSub) {
      this.userSub.unsubscribe()
    }
    this.userSub = this.afs
      .doc(`users/${user.address}`)
      .valueChanges()
      .subscribe((val: User) => {
        this.emitUser(new User(val))
      })
  }

  emitUser(user: User) {
    if (user) {
      localStorage.setItem('credentials', JSON.stringify(user))
    }
    this.currentUser.next(user)
  }

  logout() {
    console.log('logout', this.currentUser.value)
    localStorage.clear()
    this.currentUser.next(null)
    //this.afAuth.auth.signOut() // old
    this.afAuth.signOut() // new: https://github.com/angular/angularfire/issues/2409#issuecomment-615993136
    this.router.navigate(['home']) // TODO: Change this to reload same route - and hit the auth guards again
  }
}
