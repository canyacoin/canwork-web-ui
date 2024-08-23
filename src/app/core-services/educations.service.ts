import { Injectable } from '@angular/core'
import { AngularFirestore } from '@angular/fire/compat/firestore'
import { Education } from '@class/education'
import { Subscription } from 'rxjs/Subscription'

@Injectable()
export class EducationsService {
  educationSub: Subscription
  constructor(private afs: AngularFirestore) {}

  /**
   * This service is created to accomodate the add education feature on
   * the profile page, and to help easing the dock.io integration.
   */

  public addEducation(education: Education, userID: string) {
    const tempEdu = {
      id: education.id,
      university: education.university,
      degree: education.degree,
      startDate: education.startDate,
      completion: education.completion,
    }
    this.afs
      .doc(`users/${userID}/educations/${tempEdu.id}`)
      .set(tempEdu)
      .catch((error) => {
        // alert('Something went wrong. Please try again later.')
        console.log('error', error)
      })
  }

  public updateEducation(education: Education, userID: string) {
    const tempEdu = {
      id: education.id,
      university: education.university,
      degree: education.degree,
      startDate: education.startDate,
      completion: education.completion,
    }
    this.afs
      .doc(`users/${userID}/educations/${tempEdu.id}`)
      .update(tempEdu)
      .catch((error) => {
        // alert('Something went wrong. Please try again later.')
        console.log('error', error)
      })
  }

  public deleteEducation(education: Education, userID: string) {
    this.afs
      .doc(`users/${userID}/educations/${education.id}`)
      .delete()
      .catch((error) => {
        // alert('Something went wrong. Please try again later.')
        console.log('error', error)
      })
  }

  public async getEducations(userID: string) {
    const educations = this.afs.collection(`users/${userID}/educations`)
    let result: any
    this.educationSub = educations.valueChanges().subscribe((data: any) => {
      result = data
      return result
    })
  }
}
