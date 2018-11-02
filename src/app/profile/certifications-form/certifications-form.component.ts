import { Component, OnInit, Input } from '@angular/core';
import { Certification } from '../../core-classes/certification';
import { CertificationsService } from '../../core-services/certifications.service';
import { AuthService } from '../../core-services/auth.service';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { User } from '../../core-classes/user';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-certifications-form',
  templateUrl: './certifications-form.component.html',
  styleUrls: ['./certifications-form.component.css']
})
export class CertificationsFormComponent implements OnInit {

  uniInput = '';
  uniList: any;
  authSub: Subscription;
  uniListSelection = new Array();
  certificationForm: any;
  currentUser: User;
  currentCert: Certification;

  constructor(
    private auth: AuthService,
    public certifications: CertificationsService,
    private formBuilder: FormBuilder,
    private http: HttpClient) {
  }

  ngOnInit() {
    this.certifications.loadAddCert();
    this.authSub = this.auth.currentUser$.subscribe((user: User) => {
      if (user && this.currentUser !== user) {
        this.currentUser = user;
      }
    });
    this.certificationForm = this.formBuilder.group({
      university: ['', Validators.required],
      course: ['', Validators.required],
      completion: ['', Validators.required],
      isStudying: [false],
      certificate: [''],
    });
    this.getJSON().subscribe(data => {
      this.uniList = data;
    });
  }

  public getJSON(): Observable<any> {
    return this.http.get('../../assets/js/UniversityList.json');
  }

  onSubmitCertification() {
    const tempCert = new Certification;
    tempCert.university = this.certificationForm.value.university;
    tempCert.completion = this.certificationForm.value.completion;
    tempCert.course = this.certificationForm.value.course;
    tempCert.isStudying = this.certificationForm.value.isStudying;
    tempCert.certificate = this.certificationForm.value.certificate;
    console.log(tempCert);
    try {
      if (this.certifications.editCert) {
        tempCert.id = this.certifications.certToEdit.id;
        this.certifications.updateCertification(tempCert, this.currentUser.address);
      } else {
        tempCert.id = this.idGenerator();
        console.log(tempCert);
        this.certifications.addCertification(tempCert, this.currentUser.address);
      }
    } catch (error) {
      alert('Something went wrong. please try again later.')
    }
  }

  idGenerator(): string {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + '-' + s4() + '-' + s4() + '-' + s4();
  }

  onDeleteCertification(cert) {
    console.log('deleting certification ');
    console.log(cert)
    if (confirm('Are you sure you want to delete this certification? this can\'t be undone!')) {
      this.certifications.deleteCertification(cert, this.currentUser.address);
    } else {
      console.log('awww');
    }
    // this.certifications.deleteCertification(cert, this.currentUser.address);
  }
}
