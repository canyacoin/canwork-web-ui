import { Injectable } from '@angular/core'
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/firestore'
import { take } from 'rxjs/operators'

import * as moment from 'moment-timezone'
import { User } from '../core-classes/user'
import { AngularFireFunctions } from '@angular/fire/functions'
import { GetParams, SelectParams } from '../../../functions/src/firestore'
import { Observable } from 'rxjs'
import { assoc } from 'ramda'

// HACK: addType see functions/src/firestore.ts
const addType = assoc('@type', 'Person')

@Injectable()
export class UserService {
  usersCollectionRef: AngularFirestoreCollection<User>
  viewedUsersRef: AngularFirestoreCollection<User>
  firestoreGet: (data: GetParams) => Observable<User>
  firestoreSelect: (data: SelectParams) => Observable<User[]>

  constructor(
    private afs: AngularFirestore,
    private funcs: AngularFireFunctions
  ) {
    this.usersCollectionRef = this.afs.collection<User>('users')
    this.viewedUsersRef = this.afs.collection<User>('viewed-users')
    // funcs
    this.firestoreGet = this.funcs.httpsCallable('firestoreGet')
    this.firestoreSelect = this.funcs.httpsCallable('firestoreSelect')
  }

  saveProfileView(viewer: User, viewed: string) {
    const ref = this.afs.doc(`who/${viewed}/user/${viewer.address}`)
    ref
      .snapshotChanges()
      .pipe(take(1))
      .toPromise()
      .then((snap: any) => {
        const tmpModel = viewer
        tmpModel.timestamp = Date.now()
        return snap.payload.exists
          ? ref.update(this.parseUserToObject(tmpModel))
          : ref.set(this.parseUserToObject(tmpModel))
      })
  }

  addToViewedUsers(viewer: string, viewed: User) {
    const ref = this.afs
      .collection('viewed-users')
      .doc(viewer)
      .collection('viewed')
      .doc(viewed.address)
    const tmpModel = {
      address: viewed.address,
      timestamp: Date.now(),
    }
    ref.set(tmpModel)
  }

  async getViewedUsers(viewer: string) {
    const collection = this.afs.collection(
      `viewed-users/${viewer}/viewed`,
      (ref) => ref.orderBy('timestamp', 'desc')
    )
    return new Promise<any>((resolve, reject) => {
      collection
        .valueChanges()
        .pipe(take(1))
        .subscribe((result) => {
          if (result) {
            resolve(result)
          }
          reject()
        })
    })
  }

  async getOwnUser(address: string): Promise<User> {
    const startTime = Date.now() // debug profile
    return new Promise<any>((resolve, reject) => {
      this.usersCollectionRef
        .doc(address)
        .snapshotChanges()
        .pipe(take(1))
        .subscribe((snap: any) => {
          if (snap.payload.exists) {
            const user = snap.payload.data() as User

            if (user.timezone) {
              user.offset = moment.tz(user.timezone).format('Z')
            }
            const endTime = Date.now() // debug profile
            console.log(
              `time spent by getOwnUser by address ${address}: ${
                endTime - startTime
              } ms`
            ) // debug profile

            resolve(addType(user))
          }
          reject()
        })
    })

    /*const userPromise = await this.afs.collection<User>('user').doc(address).get().toPromise()
    if (userPromise.exists) {
      const user = userPromise.data();
      
      return user;
    } else {
      return null;
    }*/
    /*  
    if (userPromise) {
      const user = userPromise.payload.data() as User
      if (user) {
        if (user.timezone) {
          user.offset = moment.tz(user.timezone).format('Z')
        }
        const endTime = Date.now() // debug profile
        console.log(
          `time spent by getOwnUser by address ${address}: ${endTime - startTime} ms`
        ) // debug profile
        
        return addType(user)
      } else {
        return null
      }
    }
    return null*/
  }

  async getUser(address: string): Promise<User> {
    const startTime = Date.now() // debug profile
    const user = await this.firestoreGet({
      path: `users/${address}`,
    }).toPromise()
    const endTime = Date.now() // debug profile
    console.log(
      `time spent by getUser by address ${address}: ${endTime - startTime} ms`
    ) // debug profile
    if (user && user.timezone) {
      user.offset = moment.tz(user.timezone).format('Z')
    }

    return addType(user)
  }

  async getUserByBscAddress(address: string): Promise<User> {
    const users = await this.firestoreSelect({
      path: 'users',
      where: [['bscAddress', '==', address.toLowerCase()]],
      limit: 1,
    }).toPromise()

    return users && users.length ? addType(users[0]) : null
  }

  /*
  // obsolete, Oct 23
  async getUserByEthAddress(address: string): Promise<User> {
    const users = await this.firestoreSelect({
      path: 'users',
      where: [['ethAddressLookup', '==', address.toUpperCase()]],
      limit: 1,
    }).toPromise()

    return users && users.length ? addType(users[0]) : null
  }
  */

  async getUserBySlug(slug: string) {
    const startTime = Date.now() // debug profile

    const users = await this.firestoreSelect({
      path: 'users',
      where: [['slug', '==', slug]],
      limit: 1,
    }).toPromise()

    const endTime = Date.now() // debug profile

    console.log(
      `time spent by getUserBySlug ${slug}: ${endTime - startTime} ms`
    ) // debug profile

    return users && users.length ? addType(users[0]) : null
  }

  saveUser(credentials: User, type?: string): Promise<User> {
    return new Promise(async (resolve: any, reject: any) => {
      try {
        credentials.timestamp = Date.now()
        // localStorage.setItem('credentials', JSON.stringify(credentials));
        this.saveUserFirebase(credentials)
        resolve(credentials)
      } catch (error) {
        reject(error)
      }
    })
  }

  resetUser(userModel: User): Promise<boolean> {
    return new Promise(async (resolve: any, reject: any) => {
      try {
        const sanitizedUser = userModel
        sanitizedUser.type = null
        sanitizedUser.whitelisted = false
        sanitizedUser.whitelistRejected = false
        sanitizedUser.whitelistSubmitted = false
        sanitizedUser.work = null
        sanitizedUser.title = null
        sanitizedUser.bio = null
        sanitizedUser.description = null
        sanitizedUser.category = null
        sanitizedUser.skillTags = []
        sanitizedUser.hourlyRate = null
        sanitizedUser.timestamp = Date.now()
        this.usersCollectionRef
          .doc(sanitizedUser.address)
          .set(this.parseUserToObject(sanitizedUser))
          .then(() => {
            resolve(true)
          })
      } catch (error) {
        reject(false)
      }
    })
  }

  updateUserProperty(user: User, key: string, value: any) {
    if (user) {
      user[key] = value
      // localStorage.setItem('credentials', JSON.stringify(user));
      this.saveUserFirebase(user)
    }
  }

  private saveUserFirebase(userModel: User) {
    if (userModel && userModel.address) {
      const ref = userModel.address
      this.usersCollectionRef
        .doc(ref)
        .snapshotChanges()
        .pipe(take(1))
        .subscribe((snap: any) => {
          console.log('saveUser - payload', snap.payload.exists)
          return snap.payload.exists
            ? this.usersCollectionRef
                .doc(ref)
                .update(this.parseUserToObject(userModel))
            : this.usersCollectionRef
                .doc(ref)
                .set(this.parseUserToObject(userModel))
        })
    }
  }

  private parseUserToObject(user: User): User {
    /** User object must be re-assigned as firebase doesn't accept strong types */
    const parsedRating = Object.assign({}, user.rating)
    const parsedUser = Object.assign({}, user)
    parsedUser.rating = parsedRating
    return parsedUser
  }
}
