import { Component, OnInit, AfterViewInit, Directive } from '@angular/core'
import { Certification } from '../../core-classes/certification'
import { CertificationsService } from '../../core-services/certifications.service'
import { AuthService } from '../../core-services/auth.service'
import { Observable } from 'rxjs/Observable'
import { HttpClient } from '@angular/common/http'
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms'
import { User } from '../../core-classes/user'
import { Subscription } from 'rxjs/Subscription'

@Directive()
@Component({
  selector: 'app-certifications-form',
  templateUrl: './certifications-form.component.html',
  styleUrls: ['./certifications-form.component.css'],
})
export class CertificationsFormComponent implements OnInit, AfterViewInit {
  uniInput = ''
  uniList: any
  uniFilteredList: any
  authSub: Subscription
  uniListSelection = new Array()
  certificationForm: any
  currentUser: User
  currentCert: Certification
  yearList = new Array()
  completionYearList = new Array()
  constructor(
    private auth: AuthService,
    public certifications: CertificationsService,
    private formBuilder: FormBuilder,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.certifications.loadAddCert()
    this.authSub = this.auth.currentUser$.subscribe((user: User) => {
      if (user && this.currentUser !== user) {
        this.currentUser = user
      }
    })
    this.certificationForm = this.formBuilder.group({
      university: ['', Validators.required],
      course: ['', Validators.required],
      startDate: ['', Validators.required],
      completion: ['', Validators.required],
      isStudying: [false],
      certificate: [''],
    })
    const currentYear = new Date().getFullYear()
    const maxCompletionYear = currentYear + 10
    for (let i = 0; i < 60; i++) {
      this.yearList.push(currentYear - i)
    }
    for (let i = 0; i < 60; i++) {
      this.completionYearList.push(maxCompletionYear - i)
    }
  }

  ngAfterViewInit() {
    this.getJSON().subscribe((data) => {
      this.uniList = data
      this.uniList.sort()
    })
  }
  public getJSON(): Observable<any> {
    return this.http.get('../../assets/js/UniversityListNames.json')
  }

  onSubmitCertification() {
    const tempCert = new Certification()
    tempCert.university = this.certificationForm.value.university
    tempCert.completion = this.certificationForm.value.completion
    tempCert.course = this.certificationForm.value.course
    tempCert.startDate = this.certificationForm.value.startDate
    tempCert.isStudying = this.certificationForm.value.isStudying
    tempCert.certificate = this.certificationForm.value.certificate
    try {
      if (this.certifications.editCert) {
        tempCert.id = this.certifications.certToEdit.id
        this.certifications.updateCertification(
          tempCert,
          this.currentUser.address
        )
      } else {
        tempCert.id = this.idGenerator()
        this.certifications.addCertification(tempCert, this.currentUser.address)
      }
      document.getElementById('certificationModalClose').click()
    } catch (error) {
      this.toggleWarning()
    }
  }

  idGenerator(): string {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1)
    }
    return s4() + '-' + s4() + '-' + s4() + '-' + s4()
  }

  onDeleteCertification(cert) {
    if (
      confirm(
        "Are you sure you want to delete this certification? this can't be undone!"
      )
    ) {
      this.certifications.deleteCertification(cert, this.currentUser.address)
    }
  }

  toggleWarning() {
    document.getElementById('warning-msg').classList.toggle('active')
  }

  searchUni() {
    const input = this.certificationForm.value.university.toLowerCase()
    this.uniFilteredList = this.uniList
      .filter((uni) => uni.toLowerCase().indexOf(input) !== -1)
      .slice(0, 10)
  }
}
