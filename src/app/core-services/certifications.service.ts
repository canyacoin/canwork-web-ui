import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Certification } from '../core-classes/certification';
@Injectable()
export class CertificationsService {
  usersCollectionRef: AngularFirestoreCollection<any>;
  viewedUsersRef: AngularFirestoreCollection<any>;
  constructor(
    private afs: AngularFirestore
  ) {
  }
  /**
   * This service is created to accomodate the add certification feature on
   * the profile page, and to help easing the dock.io integration.
   */
  public addCertification(certification: Certification, userID: string) {
    console.log('adding Certification...');
    try {
      const tempCert = {
        id: certification.id,
        university: certification.university,
        course: certification.course,
        completion: certification.completion,
        isStudying: certification.isStudying,
        certificate: certification.certificate
      }
      this.afs.doc(`users/${userID}/certifications/${tempCert.id}`).set(tempCert);
    } catch (error) {
      console.error('submitForm - error', error);
    }
  }

  public deleteCertification(certification: Certification, userID: string) {
    try {
      this.afs.doc(`users/${userID}/certifications/`).set(certification);
    } catch (error) {
      console.error('submitForm - error', error);
    }
  }
}
