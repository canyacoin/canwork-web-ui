import { Component, OnDestroy, OnInit, Directive } from '@angular/core'
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { GitService } from '@service/git.service'
import { DecoratedIssue } from '@class/git'
import * as moment from 'moment'
import {
  Job,
  JobDescription,
  PaymentType,
  TimeRange,
  WorkType,
  JobState,
} from '@class/job'
import { ActionType, IJobAction } from '@class/job-action'
import { Upload } from '@class/upload'
import { User, UserType } from '@class/user'
// import '@extensions/string' // removed
import { AuthService } from '@service/auth.service'
import { JobService } from '@service/job.service'
import { PublicJobService } from '@service/public-job.service'
import { UploadService } from '@service/upload.service'
import { UserService } from '@service/user.service'
import { GenerateGuid } from '@util/generate.uid'
import * as _ from 'lodash'
import { Subscription } from 'rxjs'
import { take } from 'rxjs/operators'

import { NgxSpinnerService } from 'ngx-spinner'

import { AngularEditorConfig } from '@kolkov/angular-editor'

import { MessageService } from 'primeng/api'

interface SortingMethod {
  name: string
  code: string
  img: string
}

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
})
export class PostComponent implements OnInit, OnDestroy {
  postForm: UntypedFormGroup = null
  shareableJobForm: UntypedFormGroup = null
  loading = false
  paymentType = PaymentType
  recipientAddress = ''
  recipient: User = null
  currentUser: User
  jobPoster: any
  slug = ''
  authSub: Subscription
  routeSub: Subscription
  jobSub: Subscription
  currentDate: Date
  isShareable = false
  isSending = false
  isPreview = false
  sent = false
  draft = false
  editing = false
  error = false
  postToProvider = false
  errorGitUrl = ''
  skillTagsList: string[]
  gitUpdatedTags: string[] = []

  jobToEdit: Job
  jobForPreview: Job
  jobId: string
  jobFromNow: string
  beforeUploadFiles: any[] = []
  currentUploadNumber: number = 0
  uploadedFiles: Upload[] = []

  currentUpload: Upload
  maxFileSizeBytes = 25000000 // 25mb
  fileTooBig = false
  uploadFailed = false
  deleteFailed = false

  sharelinks: SortingMethod[] | undefined
  selectedsharelinks: SortingMethod | undefined

  date: Date // This property is bound to ngModel

  /// css variables for file upload
  hoveredFiles = false

  minDate: Date
  sentDRP: number
  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '200px',
    minHeight: '0',
    maxHeight: 'auto',
    width: 'auto',
    minWidth: '0',
    translate: 'yes',
    enableToolbar: true,
    showToolbar: true,
    placeholder:
      'Give a detailed brief of the job with adequate requirements and expectations',
    defaultParagraphSeparator: '',
    defaultFontName: '',
    defaultFontSize: '',
    fonts: [
      { class: 'arial', name: 'Arial' },
      { class: 'times-new-roman', name: 'Times New Roman' },
      { class: 'calibri', name: 'Calibri' },
      { class: 'comic-sans-ms', name: 'Comic Sans MS' },
    ],
    customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText',
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ],
    uploadUrl: 'v1/image',
    uploadWithCredentials: false,
    sanitize: true,
    toolbarPosition: 'top',
    toolbarHiddenButtons: [
      ['undo', 'redo'],
      ['subscript', 'superscript', 'strikeThrough'],
      ['indent', 'outdent'],
      [
        'unlink',
        'insertImage',
        'insertVideo',
        'insertHorizontalRule',
        'clearFormatting',
      ],
      ['foregroundColorPicker', 'backgroundColorPicker'],
    ],
  }

  // usdToAtomicCan: number // this is not used

  sortingMethods_category: SortingMethod[] | undefined

  selectedSortings_category: SortingMethod | undefined

  sortingMethods_visibility: SortingMethod[] | undefined

  selectedSortings_visibility: SortingMethod | undefined

  duplicateFileName: string[] = []
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private jobService: JobService,
    private gitService: GitService,
    private publicJobService: PublicJobService,
    private uploadService: UploadService,
    private messageService: MessageService,
    private spinner: NgxSpinnerService
  ) {
    this.postForm = formBuilder.group({
      url: [''],
      description: [
        '',
        Validators.compose([
          Validators.required,
          Validators.min(30),
          Validators.maxLength(2500),
        ]),
      ],
      title: [
        '',
        Validators.compose([Validators.required, Validators.maxLength(64)]),
      ],
      initialStage: [
        '',
        Validators.compose([Validators.required, Validators.maxLength(3000)]),
      ],
      skills: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      attachments: [''],
      workType: ['', Validators.compose([Validators.required])],
      timelineExpectation: ['', Validators.compose([Validators.required])],
      weeklyCommitment: [
        '',
        Validators.compose([
          Validators.required,
          Validators.min(1),
          Validators.max(10000000),
          Validators.pattern('^[0-9]+$'),
        ]),
      ],
      paymentType: ['Fixed price', Validators.compose([Validators.required])], // Please remove 'Fixed price' once the 'hourly rate' workflow is ready!
      budget: [
        '',
        Validators.compose([
          Validators.required,
          Validators.min(1),
          Validators.max(10000000),
          Validators.pattern('^[0-9]*$'),
        ]),
      ],
      terms: [false, Validators.requiredTrue],
    })
    this.shareableJobForm = formBuilder.group({
      url: [''],
      description: [
        '',
        Validators.compose([Validators.required, Validators.maxLength(10000)]),
      ],
      title: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(64),
        ]),
      ],
      initialStage: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      skills: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      attachments: [''],
      workType: ['', Validators.compose([Validators.required])],
      providerType: ['', Validators.compose([Validators.required])],
      deadline: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(100),
          this.ValidateCurrentDate,
        ]),
      ],
      timelineExpectation: ['', Validators.compose([Validators.required])],
      paymentType: ['Fixed price', Validators.compose([Validators.required])], // Please remove 'Fixed price' once the 'hourly rate' workflow is ready!
      visibility: ['', Validators.compose([Validators.required])],
      budget: [
        '',
        Validators.compose([
          Validators.required,
          Validators.min(1),
          Validators.max(10000000),
          Validators.pattern('^[0-9]+(.[0-9]{1,2})?$'),
        ]),
      ],
      weeklyCommitment: [
        '',
        Validators.compose([
          Validators.required,
          Validators.min(1),
          Validators.max(10000000),
          Validators.pattern('^[0-9]+$'),
        ]),
      ],
      terms: [false, Validators.requiredTrue],
    })
  }

  async ngOnInit() {
    this.sortingMethods_category = [
      {
        name: 'Content Creators',
        img: 'writer.png',
        code: 'contentCreator',
      },
      {
        name: 'Software Developers',
        img: 'dev.png',
        code: 'softwareDev',
      },
      {
        name: 'Designers & Creatives',
        img: 'creatives.png',
        code: 'designer',
      },
      {
        name: 'Marketing & SEO',
        img: 'marketing.png',
        code: 'marketing',
      },
      {
        name: 'Virtual Assistants',
        img: 'assistant.png',
        code: 'virtualAssistant',
      },
    ]
    this.selectedSortings_category = this.sortingMethods_category[0]

    this.sharelinks = [
      { name: 'Invite Freelancer', img: 'fi_user-plus.svg', code: '1' },
      { name: 'Copy Link', img: 'u_link.svg', code: '2' },
      { name: 'Twitter', img: 'x.svg', code: '3' },
      { name: 'Facebook', img: 'logos_facebook.svg', code: '4' },
      { name: 'Linkedin', img: 'devicon_linkedin.svg', code: '5' },
    ]

    this.selectedsharelinks = this.sharelinks[0]

    this.sortingMethods_visibility = [
      { name: 'Invite Only', code: 'invite', img: 'fi_user-plus.svg' },
      { name: 'Public', code: 'public', img: 'fi_users.svg' },
    ]
    this.selectedSortings_visibility = this.sortingMethods_visibility[0]
    this.editing =
      this.activatedRoute.snapshot.params['jobId'] &&
      this.activatedRoute.snapshot.params['jobId'] !== ''
    this.authSub = this.authService.currentUser$.subscribe((user: User) => {
      this.currentUser = user
      this.activatedRoute.params.take(1).subscribe((params) => {
        if (
          params['address'] &&
          params['address'] !== this.currentUser.address
        ) {
          this.recipientAddress = params['address']
          this.loadUser(this.recipientAddress)
          this.isShareable = false
          this.postToProvider = true
        } else {
          this.isShareable = true
        }
      })
      if (!this.editing) {
        this.jobId = GenerateGuid()
        this.shareableJobForm.controls['initialStage'].patchValue('Ready')
        this.shareableJobForm.controls['workType'].patchValue('One off')
        this.shareableJobForm.controls['timelineExpectation'].patchValue(
          'Up to 1 Year'
        )
        this.postForm.controls['initialStage'].patchValue('Ready')
        this.postForm.controls['workType'].patchValue('One off')
        this.postForm.controls['timelineExpectation'].patchValue('Up to 1 Year')
        if (!this.postToProvider) this.loading = true
      } else {
        console.log(
          '=============================job editing============================================'
        )
        this.jobId = this.activatedRoute.snapshot.params['jobId']
        this.jobSub = this.publicJobService
          .getPublicJob(this.activatedRoute.snapshot.params['jobId'])
          .subscribe((result) => {
            console.log('result', result)

            if (result) {
              const canEdit = result.clientId === this.currentUser.address
              if (canEdit) {
                this.jobToEdit = result
                this.shareableJobForm.controls['title'].patchValue(
                  this.jobToEdit.information.title
                )
                this.shareableJobForm.controls['description'].patchValue(
                  this.jobToEdit.information.description
                )
                this.shareableJobForm.controls['initialStage'].patchValue(
                  this.jobToEdit.information.initialStage
                )
                this.shareableJobForm.controls['providerType'].patchValue(
                  this.jobToEdit.information.providerType
                )
                this.shareableJobForm.controls['workType'].patchValue(
                  this.jobToEdit.information.workType
                )
                this.shareableJobForm.controls[
                  'timelineExpectation'
                ].patchValue(this.jobToEdit.information.timelineExpectation)
                this.shareableJobForm.controls['weeklyCommitment'].patchValue(
                  this.jobToEdit.information.weeklyCommitment
                )
                this.shareableJobForm.controls['budget'].patchValue(
                  this.jobToEdit.budget
                )
                this.shareableJobForm.controls['paymentType'].patchValue(
                  this.jobToEdit.paymentType
                )
                // this.shareableJobForm.controls['deadline'].patchValue(
                //   this.jobToEdit.deadline
                // )
                this.date = new Date(this.jobToEdit.deadline)

                console.log('this.jobToEdit.deadline', this.jobToEdit.deadline)

                let visibility = this.jobToEdit.visibility
                let visibilityIndex = this.sortingMethods_visibility.findIndex(
                  (item) => item.code === visibility
                )

                this.selectedSortings_visibility =
                  this.sortingMethods_visibility[visibilityIndex]

                let providerType = this.jobToEdit.information.providerType
                let categoryIndex = this.sortingMethods_category.findIndex(
                  (item) => item.code === providerType
                )
                this.selectedSortings_category =
                  this.sortingMethods_category[categoryIndex]

                this.shareableJobForm.controls['skills'].patchValue(
                  this.jobToEdit.information.skills
                )
                if (this.jobToEdit.information.attachments.length > 0) {
                  this.uploadedFiles = this.jobToEdit.information.attachments
                  this.beforeUploadFiles =
                    this.jobToEdit.information.attachments
                }
                this.loading = true
              } else {
                this.router.navigateByUrl('/not-found')
              }
            }
          })
      }
    })

    this.currentDate = new Date()
    this.notifyAddAddressIfNecessary()
  }

  async notifyAddAddressIfNecessary() {
    const noAddress = await this.authService.isAuthenticatedAndNoAddress()
    const user = await this.authService.getCurrentUser()
    if (noAddress && user.type == 'User') {
      console.log('test create a job posting address')
      // issuse/................................
      this.messageService.add({
        key: 'tc',
        severity: 'warn',
        summary: 'Warn',
        detail: 'Add BNB Chain (BEP20) wallet to create jobs',
      })
    }
  }

  ValidateCurrentDate(control: AbstractControl) {
    // this is validated from Validators.required
    try {
      if (!control.value.length) return null
    } catch (error) {
      return null
    }
    let deadline = new Date(control.value)
    let today = new Date()
    today.setHours(0, 0, 0, 0)
    if (deadline < today) return { pastDueDate: true }

    return null
  }

  async uploadFiles(files: FileList) {
    this.uploadFailed = false
    this.fileTooBig = false
    this.currentUploadNumber = 0

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (
        this.duplicateFileName &&
        this.duplicateFileName.includes(file.name)
      ) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `File ${file.name} is already uploaded.`,
        })
        continue
      }

      if (file.size > this.maxFileSizeBytes) {
        this.fileTooBig = true
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `File ${file.name} is too big.`,
        })
        continue
      }

      if (this.uploadFiles.length >= 10) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `You can only upload 10 files at a time.`,
        })
        return
      }

      try {
        const currentUpload = new Upload(
          this.currentUser.address,
          file.name,
          file.size
        )

        const upload: Upload =
          await this.uploadService.uploadJobAttachmentToStorage(
            this.jobId,
            currentUpload,
            file
          )

        this.currentUploadNumber++
        console.log('this.currentUploadNumber: ', this.currentUploadNumber)

        if (upload) {
          this.uploadedFiles.unshift(upload)
        } else {
          this.uploadFailed = true
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `Failed to upload file ${file.name}.`,
          })
        }
      } catch (e) {
        this.uploadFailed = true
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to upload file ${file.name}.`,
        })
      }
    }

    this.beforeUploadFiles = []
    this.beforeUploadFiles.push(...this.uploadedFiles)
  }

  onDragOver(event: DragEvent) {
    event.preventDefault()
    event.stopPropagation()
    this.hoveredFiles = true
    // Optionally add a CSS class to indicate the drag state
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault()
    event.stopPropagation()
    this.hoveredFiles = false
  }

  onDrop(event: DragEvent) {
    event.preventDefault()
    event.stopPropagation()
    this.hoveredFiles = false
    // if (event.dataTransfer && event.dataTransfer.files) {

    if (event.dataTransfer && event.dataTransfer.files) {
      for (let i = 0; i < event.dataTransfer.files.length; i++) {
        if (this.beforeUploadFiles.length > 0) {
          this.beforeUploadFiles.unshift(event.dataTransfer.files[i])
        } else {
          this.beforeUploadFiles.push(event.dataTransfer.files[i])
        }
      }
    }
    const files = event.dataTransfer.files
    this.uploadFiles(files)
  }

  detectFiles(event: any) {
    let files = event.target.files
    console.log('====================detect files=============================')
    console.log('files.length: ', files.length)
    console.log(
      'this.beforeUploadFiles.length: ',
      this.beforeUploadFiles.length
    )
    console.log('this.duplicateFileName: ', this.duplicateFileName)

    if (this.beforeUploadFiles.length > 0) {
      // Check for duplicates and populate duplicateFileName array
      files.forEach((item) => {
        const duplicate = this.beforeUploadFiles.some(
          (file) => file.name === item.name
        )
        if (duplicate) {
          this.duplicateFileName.push(item.name)
        }
      })

      // Add new files to beforeUploadFiles if they are not duplicates and meet size criteria
      files.forEach((item) => {
        if (
          !this.duplicateFileName.includes(item.name) &&
          item.size < this.maxFileSizeBytes &&
          this.beforeUploadFiles.length < 10
        ) {
          this.beforeUploadFiles.unshift(item)
        }
      })
    } else {
      // If beforeUploadFiles is empty, add files that meet size criteria
      files.forEach((item) => {
        if (
          item.size < this.maxFileSizeBytes &&
          this.beforeUploadFiles.length < 10
        ) {
          this.beforeUploadFiles.push(item)
        }
      })
    }
    console.log(
      '====================detect files after function============================='
    )
    console.log('files.length: ', files.length)
    console.log(
      'this.beforeUploadFiles.length: ',
      this.beforeUploadFiles.length
    )
    console.log('this.duplicateFileName: ', this.duplicateFileName)

    // Call uploadFiles with the files array
    this.uploadFiles(files)
  }

  async removeUpload(upload: Upload) {
    this.deleteFailed = false
    const deleted = await this.uploadService.cancelJobAttachmentUpload(
      this.jobId,
      upload
    )
    if (deleted) {
      this.uploadedFiles = this.uploadedFiles.filter((file) => file !== upload)
    } else {
      this.deleteFailed = true
    }

    this.beforeUploadFiles = []
    this.beforeUploadFiles.push(...this.uploadedFiles)
  }

  ngOnDestroy() {
    if (this.authSub) {
      this.authSub.unsubscribe()
    }
  }

  async loadUser(address: string) {
    this.recipient = await this.userService.getUser(address)
    this.loading = true
    /**
    this.userService.getUser(address).then((user: User) => {
      this.recipient = user;
    });
     */
  }

  skillTagsLoaded(tagsList: string[]) {
    this.skillTagsList = tagsList
  }

  skillTagsUpdated(value: string) {
    if (!this.isShareable) {
      this.postForm.controls['skills'].setValue(value)
    } else {
      this.shareableJobForm.controls['skills'].setValue(value)
    }
  }
  onBlurMethod(name) {
    this.shareableJobForm.controls[name].markAsDirty()
    this.shareableJobForm.controls[name].updateValueAndValidity()
  }
  onFocusMethod(name) {
    this.shareableJobForm.controls[name].markAsPristine()
  }
  checkForm() {
    if (!this.isShareable) {
      console.log(this.postForm)
    } else {
      console.log(this.shareableJobForm)
    }
  }
  workTypes(): Array<string> {
    return Object.values(WorkType)
  }

  setWorkType(type: WorkType) {
    if (!this.isShareable) {
      this.postForm.controls.workType.setValue(type)
    } else {
      this.shareableJobForm.controls.workType.setValue(type)
    }
  }

  setProviderType(item: SortingMethod) {
    this.selectedSortings_category = item
    this.shareableJobForm.controls.providerType.setValue(
      this.selectedSortings_category.code
    )
  }

  setVisibility(item: SortingMethod) {
    this.selectedSortings_visibility = item
    this.shareableJobForm.controls.visibility.setValue(
      this.selectedSortings_visibility.code
    )
  }

  timeRanges(): Array<string> {
    return Object.values(TimeRange)
  }

  setTimeRange(range: TimeRange) {
    console.log(range)
    if (this.isShareable) {
      this.shareableJobForm.controls.timelineExpectation.setValue(range)
    } else {
      this.postForm.controls.timelineExpectation.setValue(range)
    }
  }

  paymentTypes(): Array<string> {
    return Object.values(PaymentType)
  }

  setPaymentType(type: PaymentType) {
    if (this.isShareable) {
      this.shareableJobForm.controls.paymentType.setValue(type)
    } else {
      this.postForm.controls.paymentType.setValue(type)
    }
  }

  async submitForm() {
    this.error = false
    this.isSending = true
    this.spinner.show()

    let tags: string[]
    if (!this.isShareable) {
      tags =
        this.postForm.value.skills === ''
          ? []
          : this.postForm.value.skills.split(',').map((item) => item.trim())
    } else {
      tags =
        this.shareableJobForm.value.skills === ''
          ? []
          : this.shareableJobForm.value.skills
              .split(',')
              .map((item) => item.trim())
    }
    if (tags.length > 20) {
      tags = tags.slice(0, 20)
    }
    console.log('tags', tags)
    if (!tags.length) {
      tags = this.jobToEdit.information.skills
    }
    try {
      if (!this.isShareable) {
        const job = new Job({
          id: this.jobId,
          clientId: this.currentUser.address,
          providerId: this.recipientAddress,
          information: new JobDescription({
            description: this.postForm.value.description,
            title: this.postForm.value.title,
            initialStage: this.postForm.value.initialStage,
            skills: tags,
            attachments: this.uploadedFiles ? this.uploadedFiles : [],
            workType: this.postForm.value.workType,
            timelineExpectation: this.postForm.value.timelineExpectation,
            weeklyCommitment: this.postForm.value.weeklyCommitment,
          }),
          paymentType: this.postForm.value.paymentType,
          budget: this.postForm.value.budget,
        })
        const action = new IJobAction(ActionType.createJob, UserType.client)
        action.setPaymentProperties(
          job.budget,
          this.postForm.value.timelineExpectation,
          this.postForm.value.workType,
          this.postForm.value.weeklyCommitment,
          this.postForm.value.paymentType
        )
        this.sent = await this.jobService.handleJobAction(job, action)
        this.isSending = false
        if (this.sent) {
          this.isPreview = true
          this.jobService.createJobChat(
            job,
            action,
            this.currentUser,
            this.recipient
          )
        }
      } else {
        console.log('shareable job!')
      }
    } catch (e) {
      this.sent = false
      this.error = true
      this.isSending = false
    }
    this.spinner.hide()
  }

  handleGitError(msg) {
    let formRef = this.shareableJobForm
    if (!this.isShareable) formRef = this.postForm

    this.errorGitUrl = msg
    this.isSending = false
    this.shareableJobForm.controls['url'].enable()
  }

  gitApiInvoke(url) {
    let formRef = this.shareableJobForm
    if (!this.isShareable) formRef = this.postForm

    this.errorGitUrl = ''
    this.isSending = true
    this.spinner.show()

    formRef.controls['url'].patchValue(url)
    formRef.controls['url'].disable()

    this.gitService
      .getDecoratedIssue(url)
      .take(1)
      .subscribe(
        async (issue: DecoratedIssue) => {
          if (!!issue.error) return this.handleGitError(issue.error)
          if (!!issue.language) {
            let repoLang = issue.language.toLowerCase()

            let foundTag = ''
            for (let tag of this.skillTagsList) {
              if (tag.toLowerCase() == repoLang) {
                // it's equal, priority, break (i.e. java over javascript as a repoLang)
                foundTag = tag
                break
              }
              // contained into
              if (tag.toLowerCase().indexOf(repoLang) > -1) foundTag = tag
            }
            let updatedTags = []
            if (!!foundTag) updatedTags.push(foundTag)
            else updatedTags.push(issue.language) // add new tag,  not found existing one
            this.gitUpdatedTags = updatedTags
          }
          let description = ''
          description +=
            issue.inputValues.provider +
            ' "' +
            issue.inputValues.project +
            '" issue ' +
            issue.inputValues.issue +
            ' : "' +
            issue.title +
            '"'
          description += '\n'
          description += '[' + url + ']'
          description += '\n\n'
          description += issue.description

          formRef.controls['title'].patchValue(issue.title.substring(0, 64))
          formRef.controls['description'].patchValue(description)
          if (!!this.isShareable)
            formRef.controls['providerType'].patchValue('softwareDev')
          if (issue.state.toLowerCase().indexOf('open') == -1) {
            this.errorGitUrl = 'Pay attention, issue is not open'
            formRef.controls['url'].enable()
          }
          this.isSending = false
        },
        (error) => {
          let errorMsg = 'Network error'
          if (!!error && !!error.error && !!error.error.message)
            errorMsg = error.error.message
          this.handleGitError(errorMsg)
        }
      )
    this.spinner.hide()
  }

  onGitPaste(event: ClipboardEvent) {
    let clipboardData = event.clipboardData
    let pastedText = clipboardData.getData('text')
    this.gitApiInvoke(pastedText)
  }

  onBFGit() {
    this.errorGitUrl = ''
  }

  getDate(date: Date): string {
    // Create a Date object from milliseconds
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0') // Months are zero-based
    const day = date.getDate().toString().padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  getDaySuffix(day: number): string {
    if (day > 3 && day < 21) return 'th' // All days between 4 and 20 end with 'th'
    switch (day % 10) {
      case 1:
        return 'st'
      case 2:
        return 'nd'
      case 3:
        return 'rd'
      default:
        return 'th'
    }
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr)
    const day = date.getDate()
    const month = date.toLocaleString('default', { month: 'long' })
    const year = date.getFullYear()

    const daySuffix = this.getDaySuffix(day)

    return `${day}${daySuffix} ${month} ${year}`
  }

  async submitShareableJob(isDRP: number) {
    // isDRP , 0 => draft, , 1=> Preview, 2 => Post
    console.log('isDRP:', isDRP)
    this.isSending = true
    this.error = false
    this.spinner.show()
    this.sentDRP = isDRP
    this.shareableJobForm.controls.providerType.setValue(
      this.selectedSortings_category.code
    )

    try {
      let tags: string[]
      try {
        tags =
          this.shareableJobForm.value.skills === ''
            ? []
            : this.shareableJobForm.value.skills
                .split(',')
                .map((item) => item.trim())
      } catch (error) {
        console.log('error with tags:', error)
        if (!tags.length) {
          tags = this.jobToEdit.information.skills
        }
      }

      if (tags.length > 20) {
        tags = tags.slice(0, 20)
      }

      if (isDRP !== 1) {
        // Preview  is false
        if (this.editing) {
          this.jobId = this.jobToEdit.id
          this.slug = this.jobToEdit.slug
        } else {
          this.slug = await this.publicJobService.generateReadableId(
            this.shareableJobForm.value.title
          )
        }
      }

      const job = new Job({
        id: this.jobId,
        clientId: this.currentUser.address,
        slug: this.slug,
        information: new JobDescription({
          description: this.shareableJobForm.value.description,
          title: this.shareableJobForm.value.title,
          initialStage: this.shareableJobForm.value.initialStage,
          skills: tags,
          attachments: this.uploadedFiles ? this.uploadedFiles : [],
          workType: this.shareableJobForm.value.workType,
          timelineExpectation: this.shareableJobForm.value.timelineExpectation,
          weeklyCommitment: this.shareableJobForm.value.weeklyCommitment,
          providerType: this.shareableJobForm.value.providerType,
        }),
        visibility: this.shareableJobForm.value.visibility,
        paymentType: this.shareableJobForm.value.paymentType,
        budget: this.shareableJobForm.value.budget,
        deadline: this.getDate(this.shareableJobForm.value.deadline),
        draft: isDRP > 1 ? false : true,
      })
      this.draft = isDRP > 1 ? false : true

      console.log('job:', job)
      console.log('isDRP:', isDRP)

      if (isDRP > 0) {
        job.state = JobState.acceptingOffers
      } else {
        job.state = JobState.draft
      }
      if (isDRP == 1) {
        this.jobFromNow = 'Posted 1 minutes ago'
      } else {
        this.isPreview = false
      }

      const action = new IJobAction(ActionType.createJob, UserType.client)
      action.setPaymentProperties(
        job.budget,
        this.shareableJobForm.value.timelineExpectation,
        this.shareableJobForm.value.workType,
        this.shareableJobForm.value.weeklyCommitment,
        this.shareableJobForm.value.paymentType
      )
      this.sent = await this.publicJobService.handlePublicJob(job, action)
      this.jobForPreview = job
      this.isPreview = true

      this.isSending = false
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    } catch (e) {
      this.sent = false
      this.isSending = false
      this.error = true
      console.log('error with showing', e)
    }
    this.spinner.hide()
  }

  BacktoEdit() {
    this.isPreview = false
  }
}
