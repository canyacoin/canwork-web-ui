import { Injectable } from '@angular/core'
import { AngularFirestore } from '@angular/fire/compat/firestore'
import { Workhistory } from '@class/workhistory'
import { Subscription } from 'rxjs/Subscription'

@Injectable()
export class WorkhistoryService {
  workhistorySub: Subscription
  constructor(private afs: AngularFirestore) {}

  /**
   * This service is created to accomodate the add workhistory feature on
   * the profile page, and to help easing the dock.io integration.
   */

  public addWorkhistory(workhistory: Workhistory, userID: string) {
    const tempWorkhistory = {
      id: workhistory.id,
      logoUrl: workhistory.logoUrl,
      title: workhistory.title,
      employer: workhistory.employer,
      startDate: workhistory.startDate,
      completion: workhistory.completion,
      description: workhistory.description,
      tags: workhistory.tags,
    }
    this.afs
      .doc(`users/${userID}/workhistorys/${tempWorkhistory.id}`)
      .set(tempWorkhistory)
      .catch((error) => {
        // alert('Something went wrong. Please try again later.')
        console.log('error', error)
      })
  }

  public updateWorkhistory(workhistory: Workhistory, userID: string) {
    const tempWorkhistory = {
      id: workhistory.id,
      logoUrl: workhistory.logoUrl,
      title: workhistory.title,
      employer: workhistory.employer,
      startDate: workhistory.startDate,
      completion: workhistory.completion,
      description: workhistory.description,
      tags: workhistory.tags,
    }
    this.afs
      .doc(`users/${userID}/workhistorys/${tempWorkhistory.id}`)
      .update(tempWorkhistory)
      .catch((error) => {
        // alert('Something went wrong. Please try again later.')
        console.log('error', error)
      })
  }

  public deleteWorkhistory(workhistory: Workhistory, userID: string) {
    this.afs
      .doc(`users/${userID}/workhistorys/${workhistory.id}`)
      .delete()
      .catch((error) => {
        // alert('Something went wrong. Please try again later.')
        console.log('error', error)
      })
  }

  public async getWorkhistorys(userID: string) {
    const workhistorys = this.afs.collection(`users/${userID}/workhistorys`)
    let result: any
    this.workhistorySub = workhistorys.valueChanges().subscribe((data: any) => {
      result = data
      return result
    })
  }
}
