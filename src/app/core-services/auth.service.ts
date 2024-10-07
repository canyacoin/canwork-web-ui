import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { AngularFireAuth } from '@angular/fire/compat/auth'
import { AngularFirestore } from '@angular/fire/compat/firestore'
import { BehaviorSubject, Subscription, Observable } from 'rxjs'
import { UserType } from '../core-classes/user'

import { User } from '../core-classes/user'

@Injectable()
export class AuthService {
  userSub: Subscription

  /*
  private userTypeSubject: BehaviorSubject<UserType> = new BehaviorSubject<UserType>(UserType.client) // default value
  public userType$: Observable<UserType> = this.userTypeSubject.asObservable()

  public currentUser = new BehaviorSubject<User>(null)
  public currentUser$ = this.currentUser.asObservable()
  */

  private userTypeSubject: BehaviorSubject<UserType>
  public userType$: Observable<UserType>

  public currentUser
  public currentUser$

  private isLocalStorageAvailable = typeof localStorage !== 'undefined'

  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private router: Router
  ) {
    console.log(
      'AuthService this.isLocalStorageAvailable: ' +
        this.isLocalStorageAvailable
    )
    if (!this.isLocalStorageAvailable) return

    this.userTypeSubject = new BehaviorSubject<UserType>(UserType.client) // default value
    this.userType$ = this.userTypeSubject.asObservable()

    this.currentUser = new BehaviorSubject<User>(null)
    this.currentUser$ = this.currentUser.asObservable()

    const savedUser = JSON.parse(localStorage.getItem('credentials'))
    if (savedUser) {
      this.setUser(savedUser)
    }
    const userType = localStorage.getItem('userType') as UserType
    if (userType) {
      this.setUserType(userType)
    }
  }

  setUserType(userType: UserType): void {
    localStorage.setItem('userType', userType)
    this.userTypeSubject.next(userType)
  }

  getCurrentUser(): Promise<User> {
    if (this.isLocalStorageAvailable && this.currentUser.value) {
      return Promise.resolve(this.currentUser.value)
    }
    return Promise.reject(null)
  }

  getCurrentUserType(): Promise<UserType> {
    if (this.userTypeSubject.value) {
      return Promise.resolve(this.userTypeSubject.value)
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
      this.afAuth.onAuthStateChanged(async (user) => {
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
    // console.trace()
    if (this.isLocalStorageAvailable && user) {
      localStorage.setItem('credentials', JSON.stringify(user))
    }
    this.currentUser.next(user)
  }

  logout() {
    /*
    avoid propagation of user when logging out and emitUser again into orinal userSub
    this was causing an issue:
    the need to logout 2 times to actually logout for ui
    */
    if (this.userSub) this.userSub.unsubscribe()

    if (this.isLocalStorageAvailable) localStorage.clear()

    this.currentUser.next(null)

    //this.afAuth.auth.signOut() // old angular version
    this.afAuth.signOut() // new: https://github.com/angular/angularfire/issues/2409#issuecomment-615993136

    /* reload same route
       and hit the auth guards again
      (this is guaranteed by option runGuardsAndResolvers: 'always' on protected routes)
    */
    const currentUrl = this.router.url
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl])
    })
  }
}
