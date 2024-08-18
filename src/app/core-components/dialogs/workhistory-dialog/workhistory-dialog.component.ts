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
import { UntypedFormBuilder, Validators } from '@angular/forms'
import { Subscription } from 'rxjs/Subscription'
import { MessageService } from 'primeng/api'
import { AngularFireStorage } from '@angular/fire/compat/storage'

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

  filePath: string

  isUploading: boolean = false
  selectedFile: File | null = null
  selectedFileUrl: string | ArrayBuffer

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

  updatedTags: string[] = []

  constructor(
    private messageService: MessageService,
    private auth: AuthService,
    public workhistorys: WorkhistoryService,
    private formBuilder: UntypedFormBuilder,
    private storage: AngularFireStorage
  ) {}

  ngOnInit() {
    this.authSub = this.auth.currentUser$.subscribe((user: User) => {
      if (user && this.currentUser !== user) {
        this.currentUser = user
      }
    })
    this.buildForm()
    const currentYear = new Date().getFullYear()
    const maxCompletionYear = currentYear + 10
    for (let i = 0; i < 60; i++) {
      this.yearList.push(currentYear - i)
    }
    for (let i = 0; i < 60; i++) {
      this.completionYearList.push(maxCompletionYear - i)
    }
    if (this.currentUser) {
      this.filePath = `uploads/workhistorys/${this.currentUser.address}`
      console.log('this.filePath', this.filePath)
    }
  }

  buildForm() {
    this.updatedTags = []
    this.workhistoryForm = this.formBuilder.group({
      logoUrl: [''],
      title: ['', Validators.required],
      employer: ['', Validators.required],
      startDate: ['', Validators.required],
      completion: ['', Validators.required],
      description: ['', Validators.required],
      tags: [[], Validators.required],
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selectedWorkhistory && this.visible === true) {
      console.log('selectedWorkhistory', this.selectedWorkhistory)
      if (this.selectedWorkhistory !== null) {
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
        this.workhistoryForm.controls.tags.setValue(
          this.selectedWorkhistory.tags
        )
        this.updatedTags = this.selectedWorkhistory.tags
      } else {
        this.buildForm()
      }
    }
  }

  ngOnDestroy() {
    if (this.authSub) {
      this.authSub.unsubscribe()
    }
  }

  async onSubmitWorkhistory() {
    const tempWorkhistory = new Workhistory()
    tempWorkhistory.logoUrl = ''
    tempWorkhistory.title = this.workhistoryForm.value.title
    tempWorkhistory.employer = this.workhistoryForm.value.employer
    tempWorkhistory.startDate = this.workhistoryForm.value.startDate
    tempWorkhistory.completion = this.workhistoryForm.value.completion
    tempWorkhistory.description = this.workhistoryForm.value.description
    tempWorkhistory.tags = this.workhistoryForm.value.tags

    if (this.selectedWorkhistory !== null) {
      tempWorkhistory.id = this.selectedWorkhistory.id
    } else {
      tempWorkhistory.id = this.idGenerator()
    }
    if (this.selectedFile !== null) {
      const task = this.storage.upload(
        this.filePath + '/' + tempWorkhistory.id,
        this.selectedFile
      )

      console.log('task:', task)

      // isUploading
      this.isUploading = true
      try {
        const snap = await task.snapshotChanges().toPromise()
        const url = await snap.ref.getDownloadURL()
        tempWorkhistory.logoUrl = url
      } catch (err) {
      } finally {
        this.isUploading = false
      }
    }

    try {
      if (this.selectedWorkhistory !== null) {
        this.workhistorys.updateWorkhistory(
          tempWorkhistory,
          this.currentUser.address
        )
      } else {
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

  skillTagsUpdated(value: string) {
    let tags: string[] =
      value === '' ? [] : value.split(',').map((item) => item.trim())
    this.workhistoryForm.controls['tags'].setValue(tags)
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
      return 'Add Work Experience'
    } else {
      return 'Edit Work Experience'
    }
  }
  onClose() {
    this.visible = false
  }

  onSave(event: Event) {
    event.preventDefault()
    this.onSubmitWorkhistory()
    this.visible = false
  }

  detectFiles(event: Event) {
    const input = event.target as HTMLInputElement
    if (input.files && input.files.length) {
      const file = input.files[0]

      // Check if the file type is an image
      const validImageTypes = ['image/jpg', 'image/jpeg', 'image/png']
      if (!validImageTypes.includes(file.type)) {
        alert('Please select a valid image file (jpg, jpeg, or png).')
        return
      }

      // Check if the file size is under 4MB
      const maxSizeInMB = 4
      if (file.size > maxSizeInMB * 1024 * 1024) {
        alert('The selected file is too large. Please select a file under 4MB.')
        return
      }

      // If the file is valid, read it and set the selectedFile property
      const reader = new FileReader()

      reader.onload = () => {
        this.selectedFileUrl = reader.result
        this.selectedFile = file
      }

      reader.readAsDataURL(file)
    }
  }
}
