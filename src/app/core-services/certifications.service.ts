import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { Certification } from '../core-classes/certification';
import { Subscription } from 'rxjs/Subscription';

@Injectable()
export class CertificationsService {

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
    const tempCert = {
      id: certification.id,
      university: certification.university,
      course: certification.course,
      startDate: certification.startDate,
      completion: certification.completion,
      isStudying: certification.isStudying,
      certificate: certification.certificate
    }
    this.afs.doc(`users/${userID}/certifications/${tempCert.id}`).set(tempCert).catch(error => {
      alert('Something went wrong. Please try again later.');
      console.log(error);
    });
  }


  public updateCertification(certification: Certification, userID: string) {
    console.log('updating Certification...');
    const tempCert = {
      id: certification.id,
      university: certification.university,
      course: certification.course,
      startDate: certification.startDate,
      completion: certification.completion,
      isStudying: certification.isStudying,
      certificate: certification.certificate
    }
    this.afs.doc(`users/${userID}/certifications/${tempCert.id}`).update(tempCert).catch(error => {
      alert('Something went wrong. Please try again later.');
      console.log(error);
    });
  }

  public deleteCertification(certification: Certification, userID: string) {
    this.afs.doc(`users/${userID}/certifications/${certification.id}`).delete().catch(error => {
      alert('Something went wrong. Please try again later.');
      console.log(error);
    });
  }

  public async getCertifications(userID: string) {
    console.log('Fetching certifications...');
    const certifications = this.afs.collection(`users/${userID}/certifications`);
    let result: any;
    this.certificationSub = certifications.valueChanges().subscribe((data: any) => {
      result = data;
      console.log(result);
      return result;
    });
  }

  public loadAddCert() {
    console.log('Adding certification...');
    this.certToEdit = null;
    this.editCert = false;
  }

  public loadEditCert(cert) {
    console.log('Editing certification...');
    this.certToEdit = cert;
    this.editCert = true;
  }

}
