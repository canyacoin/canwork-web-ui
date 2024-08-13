import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core'
import { User } from '@class/user'
import { Workhistory } from '@class/workhistory'
import { WorkhistoryService } from '@service/workhistory.service'
import { AuthService } from '@service/auth.service'
import { HttpClient } from '@angular/common/http'
import { UntypedFormBuilder, Validators } from '@angular/forms'
import { Subscription } from 'rxjs/Subscription'
import { MessageService } from 'primeng/api'

@Component({
  selector: 'workhistory-dialog',
  templateUrl: './workhistory-dialog.component.html',
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

  @Input() selectedWorkhistory: Workhistory | null = null

  uniInput = ''
  uniList: any
  uniFilteredList: any
  authSub: Subscription
  uniListSelection = new Array()
  workhistoryForm: any
  currentUser: User
  currentWorkhistory: Workhistory
  yearList = new Array()
  completionYearList = new Array()

  constructor(
    private messageService: MessageService,
    private auth: AuthService,
    public workhistorys: WorkhistoryService,
    private formBuilder: UntypedFormBuilder,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.authSub = this.auth.currentUser$.subscribe((user: User) => {
      if (user && this.currentUser !== user) {
        this.currentUser = user
      }
    })
    this.workhistoryForm = this.formBuilder.group({
      logoUrl: ['', Validators.required],
      title: ['', Validators.required],
      employer: ['', Validators.required],
      startDate: ['', Validators.required],
      completion: ['', Validators.required],
      description: ['', Validators.required],
      tags: [[], Validators.required],
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
    if (changes.selectedWorkhistory && this.visible === true) {
      this.workhistoryForm.controls.logoUrl.setValue(
        this.selectedWorkhistory.logoUrl
      )
      this.workhistoryForm.controls.title.setValue(
        this.selectedWorkhistory.title
      )
      this.workhistoryForm.controls.employer.setValue(
        this.selectedWorkhistory.employer
      )
      this.workhistoryForm.controls.startDate.setValue(
        this.selectedWorkhistory.startDate
      )
      this.workhistoryForm.controls.completion.setValue(
        this.selectedWorkhistory.completion
      )
      this.workhistoryForm.controls.description.setValue(
        this.selectedWorkhistory.description
      )
      this.workhistoryForm.controls.tags.setValue(this.selectedWorkhistory.tags)
    }
  }

  ngOnDestroy() {
    if (this.authSub) {
      this.authSub.unsubscribe()
    }
  }

  onSubmitEducation() {
    const tempWorkhistory = new Workhistory()
    tempWorkhistory.logoUrl = this.workhistoryForm.value.logoUrl
    tempWorkhistory.title = this.workhistoryForm.value.title
    tempWorkhistory.employer = this.workhistoryForm.value.employer
    tempWorkhistory.startDate = this.workhistoryForm.value.startDate
    tempWorkhistory.completion = this.workhistoryForm.value.completion
    tempWorkhistory.description = this.workhistoryForm.value.description
    tempWorkhistory.tags = this.workhistoryForm.value.tags

    try {
      if (this.selectedWorkhistory !== null) {
        tempWorkhistory.id = this.selectedWorkhistory.id
        this.workhistorys.updateWorkhistory(
          tempWorkhistory,
          this.currentUser.address
        )
      } else {
        tempWorkhistory.id = this.idGenerator()
        this.workhistorys.addWorkhistory(
          tempWorkhistory,
          this.currentUser.address
        )
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

  getDialogHeader() {
    if (this.selectedWorkhistory === null) {
      return 'Add Workhistory'
    } else {
      return 'Edit Workhistory'
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
