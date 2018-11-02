import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Certification } from '../core-classes/certification';
import { Subscription } from 'rxjs/Subscription';

@Injectable()
export class CertificationsService {
  usersCollectionRef: AngularFirestoreCollection<any>;
  viewedUsersRef: AngularFirestoreCollection<any>;
  certificationSub: Subscription;
  constructor(
    private afs: AngularFirestore
  ) {
  }

  editCert = false;
  certToEdit: Certification;

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


  public updateCertification(certification: Certification, userID: string) {
    console.log('updating Certification...');
    try {
      const tempCert = {
        id: certification.id,
        university: certification.university,
        course: certification.course,
        completion: certification.completion,
        isStudying: certification.isStudying,
        certificate: certification.certificate
      }
      this.afs.doc(`users/${userID}/certifications/${tempCert.id}`).update(tempCert);
    } catch (error) {
      console.error('submitForm - error', error);
    }
  }

  public deleteCertification(certification: Certification, userID: string) {
    try {
      this.afs.doc(`users/${userID}/certifications/${certification.id}`).delete();
    } catch (error) {
      console.error('submitForm - error', error);
    }
  }

  public async getCertifications(userID: string) {
    console.log('fetching certifications...');
    const certifications = this.afs.collection(`users/${userID}/certifications`);
    let result: any;
    this.certificationSub = certifications.valueChanges().subscribe((data: any) => {
      result = data;
      console.log(result);
      return result;
    });
  }

  public loadAddCert() {
    console.log('Received request to add cert');
    this.certToEdit = null;
    this.editCert = false;
  }
  public loadEditCert(cert) {
    console.log('Received edit for cert : ');
    console.log(cert);
    this.certToEdit = cert;
    this.editCert = true;
  }

}
