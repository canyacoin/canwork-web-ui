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
import { Education } from '@class/education'
import { EducationsService } from '@service/educations.service'
import { AuthService } from '@service/auth.service'
import { Observable } from 'rxjs/Observable'
import { HttpClient } from '@angular/common/http'
import { UntypedFormBuilder, Validators } from '@angular/forms'
import { Subscription } from 'rxjs/Subscription'
import { MessageService } from 'primeng/api'

@Component({
  selector: 'workhistory-dialog',
  templateUrl: './workhistory-dialog.component.html'
})
export class WorkhistoryDialogComponent {
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

  @Input() selectedEducation: Education | null = null

  uniInput = ''
  uniList: any
  uniFilteredList: any
  authSub: Subscription
  uniListSelection = new Array()
  educationForm: any
  currentUser: User
  currentEdu: Education
  yearList = new Array()
  completionYearList = new Array()

  constructor(
    private messageService: MessageService,
    private auth: AuthService,
    public educations: EducationsService,
    private formBuilder: UntypedFormBuilder,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.authSub = this.auth.currentUser$.subscribe((user: User) => {
      if (user && this.currentUser !== user) {
        this.currentUser = user
      }
    })
    this.educationForm = this.formBuilder.group({
      university: ['', Validators.required],
      degree: ['', Validators.required],
      startDate: ['', Validators.required],
      completion: ['', Validators.required],
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
    if (changes.selectedEducation && this.visible === true) {
      this.educationForm.controls.university.setValue(
        this.selectedEducation.university
      )
      this.educationForm.controls.degree.setValue(this.selectedEducation.degree)
      this.educationForm.controls.startDate.setValue(
        this.selectedEducation.startDate
      )
      this.educationForm.controls.completion.setValue(
        this.selectedEducation.completion
      )
    }
  }

  ngOnDestroy() {
    if (this.authSub) {
      this.authSub.unsubscribe()
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

  onSubmitEducation() {
    const tempEdu = new Education()
    tempEdu.university = this.educationForm.value.university
    tempEdu.completion = this.educationForm.value.completion
    tempEdu.degree = this.educationForm.value.degree
    tempEdu.startDate = this.educationForm.value.startDate
    try {
      if (this.selectedEducation !== null) {
        tempEdu.id = this.selectedEducation.id
        this.educations.updateEducation(tempEdu, this.currentUser.address)
      } else {
        tempEdu.id = this.idGenerator()
        this.educations.addEducation(tempEdu, this.currentUser.address)
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
    const input = this.educationForm.value.university.toLowerCase()
    this.uniFilteredList = this.uniList
      .filter((uni) => uni.toLowerCase().indexOf(input) !== -1)
      .slice(0, 10)
  }

  getDialogHeader() {
    if (this.selectedEducation === null) {
      return 'Add Education'
    } else {
      return 'Edit Education'
    }
  }
  onClose() {
    this.visible = false
  }

  onSave(event: Event) {
    event.preventDefault()
    this.onSubmitEducation()
    this.visible = false
  }
}
