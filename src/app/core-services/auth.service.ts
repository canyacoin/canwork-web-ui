import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { AngularFireAuth } from 'angularfire2/auth'
import { AngularFirestore } from 'angularfire2/firestore'
import { BehaviorSubject, Subscription } from 'rxjs'

import * as firebase from 'firebase/app'
import { User } from '../core-classes/user'

import { environment } from '@env/environment'

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

  isAdmin() {
    /*
    TODO: next step, on top of this check (transient)
      add check to verify if currentUser has isAdmin property to true
      and implement an admin route to save me with isAdmin to true,
      so i can remove my address from ids not yet completed the setup
    TODO add to user properties admin:boolean and ethAddress:string
      
    */
    return environment.admin.ids.includes(this.currentUser.value.address)
  }

  async isAuthenticatedAndNoAddress(): Promise<boolean> {
    const user = await this.getCurrentUser()
    return Promise.resolve(!!user && !user.bnbAddress)
  }

  async getJwt(): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      await firebase.auth().onAuthStateChanged(async user => {
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
    this.afAuth.auth.signOut()
    this.router.navigate(['home']) // TODO: Change this to reload same route - and hit the auth guards again
  }
}
