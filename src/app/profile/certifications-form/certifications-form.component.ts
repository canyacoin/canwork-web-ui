import { Component, OnInit } from '@angular/core';
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
  constructor(
    private auth: AuthService,
    private certifications: CertificationsService,
    private formBuilder: FormBuilder,
    private http: HttpClient) {
  }


  ngOnInit() {

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
    tempCert.id = this.idGenerator();
    tempCert.university = this.certificationForm.value.university;
    tempCert.completion = this.certificationForm.value.completion;
    tempCert.course = this.certificationForm.value.course;
    tempCert.isStudying = this.certificationForm.value.isStudying;
    tempCert.certificate = this.certificationForm.value.certificate;
    console.log(tempCert);
    try {
      this.certifications.addCertification(tempCert, this.currentUser.address);
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
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4();
  }
}
