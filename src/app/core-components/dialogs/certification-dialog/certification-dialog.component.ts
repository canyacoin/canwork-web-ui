import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  AfterViewInit,
  SimpleChanges,
} from '@angular/core'
import { User } from '@class/user'
import { Certification } from '@class/certification'
import { CertificationsService } from '@service/certifications.service'
import { AuthService } from '@service/auth.service'
import { Observable } from 'rxjs/Observable'
import { HttpClient } from '@angular/common/http'
import { UntypedFormBuilder, Validators } from '@angular/forms'
import { Subscription } from 'rxjs/Subscription'
import { MessageService } from 'primeng/api'

@Component({
  selector: 'certification-dialog',
  templateUrl: './certification-dialog.component.html',
})
export class CertificationDialogComponent implements OnInit, AfterViewInit {
  // two way data binding
  private _visible: boolean
  @Input()
  get visible(): boolean {
    return this._visible
  }
  set visible(value: boolean) {
    this._visible = value
    this.visibleChange.emit(this._visible)
  }
  @Output() visibleChange = new EventEmitter<boolean>()

  @Input() selectedCertification: Certification | null = null

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
    private messageService: MessageService,
    private auth: AuthService,
    public certifications: CertificationsService,
    private formBuilder: UntypedFormBuilder,
    private http: HttpClient
  ) {}

  ngOnInit() {
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selectedCertification && this.visible === true) {
      this.certificationForm.controls.university.setValue(
        this.selectedCertification.university
      )
      this.certificationForm.controls.course.setValue(
        this.selectedCertification.course
      )
      this.certificationForm.controls.startDate.setValue(
        this.selectedCertification.startDate
      )
      this.certificationForm.controls.completion.setValue(
        this.selectedCertification.completion
      )
      this.certificationForm.controls.certificate.setValue(
        this.selectedCertification.certificate
      )
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
      if (this.selectedCertification !== null) {
        tempCert.id = this.selectedCertification.id
        this.certifications.updateCertification(
          tempCert,
          this.currentUser.address
        )
      } else {
        tempCert.id = this.idGenerator()
        this.certifications.addCertification(tempCert, this.currentUser.address)
      }
    } catch (error) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warn',
        detail: `Something went wrong. Please try again later.`,
      })
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

  searchUni() {
    const input = this.certificationForm.value.university.toLowerCase()
    this.uniFilteredList = this.uniList
      .filter((uni) => uni.toLowerCase().indexOf(input) !== -1)
      .slice(0, 10)
  }

  getDialogHeader() {
    if (this.selectedCertification === null) {
      return 'Add Certification'
    } else {
      return 'Edit Certification'
    }
  }
  onClose() {
    this.visible = false
  }

  onSave(event: Event) {
    event.preventDefault()
    this.onSubmitCertification()
    this.visible = false
  }
}
