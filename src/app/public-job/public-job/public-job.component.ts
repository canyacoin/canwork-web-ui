import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
} from '@angular/core'
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'

import { User } from '@class/user'
import { Bid, Job, JobState } from '@class/job'
import { Upload } from '@class/upload'
// service
import { AuthService } from '@service/auth.service'
import { PublicJobService } from '@service/public-job.service'
import { UserService } from '@service/user.service'
import { UploadService } from '@service/upload.service'
import { NgxSpinnerService } from 'ngx-spinner'
import { MessageService } from 'primeng/api'

import { Subscription } from 'rxjs'
import { take } from 'rxjs/operators'
import { environment } from '@env/environment'
import { AngularFireStorage } from '@angular/fire/compat/storage'

import { AngularFireAuth } from '@angular/fire/compat/auth'
import { FirebaseUISignInSuccessWithAuthResult } from 'firebaseui-angular'

import { customAngularEditorConfig } from 'app/core-functions/angularEditorConfig'
import { Tab } from '@class/tabs'
import { isPlatformBrowser, isPlatformServer } from '@angular/common'

@Component({
  selector: 'app-public-job',
  templateUrl: './public-job.component.html',
})
export class PublicJobComponent implements OnInit, OnDestroy {
  bidForm: UntypedFormGroup = null
  bids: any[]
  authSub: Subscription
  bidsSub: Subscription
  jobSub: Subscription

  canBid: boolean
  isSent: boolean = false
  canSee = false
  hideDescription = false
  isPublic = false
  isMyJob = false
  loading = true
  shareableLink: string
  link: string
  job: Job
  currentUser: User
  hasCurrentUser: boolean = false
  jobPoster: any = null
  jobFromNow: string = ''

  isShownTab: boolean = false

  activeJobTypes: Tab[]
  selectedJob: Tab

  bidPrice: number = 0
  hoveredFiles: boolean = false
  isProvider: boolean = false

  // new feature files upload

  beforeUploadFiles: any[] = []
  currentUploadNumber: number = 0
  uploadedFiles: Upload[] = []

  isCurrentUpload: boolean = false
  maxFileSizeBytes = 50000000 // 50mb
  fileTooBig = false
  uploadFailed = false
  deleteFailed = false
  duplicateFileNames: string[] = []

  // Your application
  yourApplication: Bid

  // validators for your application
  bidMessageValidated: boolean = false
  priceValidated: boolean = false

  // modal handlers
  visibleDeleteModal: boolean = false
  visibleWithdrawModal: boolean = false
  visibleLoginModal: boolean = false
  visibleWithdrawSuccessModal: boolean = false
  visibleDeletedSuccessModal: boolean = false

  dublicateFilename: string[] = []

  // Angular Editor Config
  coverLetterConfig = customAngularEditorConfig()

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private userService: UserService,
    private publicJobsService: PublicJobService,
    private storage: AngularFireStorage,
    private formBuilder: UntypedFormBuilder,
    private spinner: NgxSpinnerService,
    private uploadService: UploadService,
    private route: ActivatedRoute,
    private router: Router,
    private afAuth: AngularFireAuth,
    private messageService: MessageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.bidForm = this.formBuilder.group({
      price: [
        '',
        Validators.compose([
          Validators.required,
          Validators.min(1),
          Validators.max(10000000),
          // Validators.pattern('^[0-9]*$'),
        ]),
      ],
      message: [
        '',
        Validators.compose([
          Validators.required,
          Validators.min(30),
          Validators.maxLength(10000),
        ]),
      ],
    })
  }

  async ngOnInit() {
    if (isPlatformBrowser(this.platformId)) this.spinner.show()
    this.activeJobTypes = [
      { label: 'Job Details', code: 'jobsdetail' },
      { label: 'Proposals', code: 'proposals' },
    ]
    this.selectedJob = this.activeJobTypes[0]
    this.shareableLink = environment.shareBaseUrl

    this.authSub = this.authService.currentUser$.subscribe((user: User) => {
      if (user) {
        this.currentUser = user
      }
    })
    this.activatedRoute.params.pipe(take(1)).subscribe((params) => {
      if (params['jobId']) {
        this.jobSub = this.publicJobsService
          .getPublicJob(params['jobId'])
          .subscribe((publicJob) => {
            if (publicJob === undefined) {
              this.canSee = false
              this.loading = false
            } else {
              this.job = publicJob
              console.log('this.Job', this.job)
              this.initJob(this.job)

              this.bidsSub = this.publicJobsService
                .getPublicJobBids(params['jobId'])
                .subscribe((result) => {
                  this.bids = result || []
                })
            }
          })
      } else if (params['slug']) {
        console.log('params slug:', params['slug'])
        this.jobSub = this.publicJobsService
          .getPublicJobBySlug(params['slug'])
          .subscribe((publicJob) => {
            if (publicJob === null) {
              this.canSee = false
              this.loading = false
            } else {
              this.job = publicJob as Job
              this.initJob(this.job)

              this.bidsSub = this.publicJobsService
                .getPublicJobBids(publicJob.id)
                .subscribe((result) => {
                  this.bids = result || []
                  console.log('this.bids: ', this.bids)
                  if (this.currentUser) {
                    this.bids.map((bid) => {
                      if (bid.providerId === this.currentUser.address) {
                        console.log('this.yourApplication: ', bid)
                        this.yourApplication = bid
                      }
                    })
                  }
                })
            }
          })
      }
    })
    // check visibility if it is a direct job or not. If the job is direct job, which means invite only, then can't show the tabs
    this.isShownTab =
      this.currentUser && this.isProvider && this.job.visibility !== 'invite'
    if (isPlatformBrowser(this.platformId)) this.spinner.hide()
  }

  async uploadFiles(files: FileList) {
    this.messageService.clear()
    this.uploadFailed = false
    this.fileTooBig = false
    this.currentUploadNumber = 0
    this.isCurrentUpload = true

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (
        this.duplicateFileNames &&
        this.duplicateFileNames.includes(file.name)
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

      if (this.uploadedFiles.length >= 10) {
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
            this.job.id,
            currentUpload,
            file
          )

        this.currentUploadNumber++

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
    this.isCurrentUpload = false
    console.log('this.isCurrentUpload', this.isCurrentUpload)

    this.beforeUploadFiles = []
    this.beforeUploadFiles.push(...this.uploadedFiles)
  }

  changeJob(item: Tab) {
    this.selectedJob = item
  }
  ngOnDestroy() {
    if (this.bidsSub) {
      this.bidsSub.unsubscribe()
    }
    this.jobSub.unsubscribe()
    this.authSub.unsubscribe()
  }

  async initJob(job: Job) {
    if (this.currentUser) {
      this.isMyJob = job.clientId === this.currentUser.address
      this.isPublic = job.visibility === 'public'
      // await this.setClient(this.job.clientId)

      if (this.currentUser.type === 'Provider') {
        this.isProvider = true
        const check: boolean = await this.publicJobsService.canBid(
          this.currentUser.address,
          this.job
        )
        this.canBid = check
      }
      console.log('this.canBid', this.canBid)
      // if (
      //   this.canBid &&
      //   this.currentUser.bscAddress &&
      //   this.currentUser.type === 'Provider' &&
      //   !this.isMyJob &&
      //   this.isOpen &&
      //   this.activatedRoute.snapshot.queryParams['nextAction'] === 'bid'
      // )
      //   $('#bidModal').modal('show')
    } else {
      this.isProvider = false
      this.isMyJob = false
    }
    if (job.draft && !this.isMyJob) {
      // only allow the job creator to see jobs in draft state
      this.canSee = false
    } else {
      this.canSee = true
    }
    this.setAttachmentUrl()
  }
  async cancelJob(event: Event) {
    event.stopPropagation()
    this.visibleDeleteModal = false

    if (this.isMyJob) {
      const updated = await this.publicJobsService.cancelJob(this.job.id)
      if (updated) {
        this.job.state = JobState.closed
        this.visibleDeletedSuccessModal = true
      }
    }
  }

  async submitBid() {
    if (
      this.bidForm.value.message.length < 5 &&
      this.bidForm.value.message.length > 2500
    ) {
      this.bidMessageValidated = true
      return
    }
    if (this.bidForm.value.price <= 0) {
      this.priceValidated = true
      return
    }

    if (isPlatformBrowser(this.platformId)) this.spinner.show()

    const providerInfo = {
      name: this.currentUser.name,
      skillTags: this.currentUser.skillTags,
      title: this.currentUser.title,
      timezone: this.currentUser.timezone,
      avatar: this.currentUser.avatar,
    }

    if (this.currentUser.whitelisted) {
      const bidToSubmit = new Bid(
        this.currentUser.address,
        providerInfo,
        this.bidForm.value.price,
        this.bidForm.value.message,
        Date.now(),
        this.uploadedFiles ? this.uploadedFiles : []
      )
      this.isSent = await this.publicJobsService.handlePublicBid(
        bidToSubmit,
        this.job
      )
      this.canBid = false
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: `You have not been approved as a provider.`,
      })
    }
    if (isPlatformBrowser(this.platformId)) this.spinner.hide()
    this.loading = false
  }

  createLink() {
    let link = ''
    if (this.job.slug) {
      link =
        'https://canwork.io/jobs/public/' +
        this.job.slug.replace(/\(/g, '%28').replace(/\)/g, '%29')
    } else {
      link = this.shareableLink + '/job/' + this.job.id
    }
    this.link = link
  }

  copyLink() {
    const selBox = document.createElement('textarea')
    selBox.style.position = 'fixed'
    selBox.style.left = '0'
    selBox.style.top = '0'
    selBox.style.opacity = '0'
    selBox.value = this.link
    document.body.appendChild(selBox)
    selBox.select()
    selBox.focus()
    document.execCommand('copy')
    document.body.removeChild(selBox)
    if (isPlatformBrowser(this.platformId)) {
      document.getElementById('copied').style.display = 'block'
      setTimeout(function () {
        document.getElementById('copied').style.display = 'none'
      }, 2000)
    }
  }

  private async setAttachmentUrl() {
    const attachment = this.job.information.attachments
    if (attachment.length > 0) {
      // check if there's any attachment on this job
      if (attachment[0].url === null || attachment[0].url === undefined) {
        // [0] is used here since we only support single file upload anyway.
        if (attachment[0].filePath != null) {
          // Assume that it's caused by the async issue
          let getUrl: Subscription
          const filePath = attachment[0].filePath
          const fileRef = this.storage.ref(filePath)
          getUrl = fileRef.getDownloadURL().subscribe((result) => {
            this.job.information.attachments[0].url = result
          })
        }
      }
    }
  }
  /*
  // obsolete, Oct 23
  async getProviderData(id) {
    const provider = await this.userService.getUserByEthAddress(id)
    return provider
  }
  */

  toLocaleDateString(timestamp) {
    const date = new Date(parseInt(timestamp, 10))
    return date.toLocaleDateString()
  }

  toggleDescription() {
    this.hideDescription = !this.hideDescription
  }

  // Drag and Drop

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
    if (!this.isCurrentUpload) {
      if (event.dataTransfer && event.dataTransfer.files) {
        let files = event.dataTransfer.files
        if (this.beforeUploadFiles.length > 0) {
          // Check for duplicates and populate duplicateFileNames array
          for (let i = 0; i < files.length; i++) {
            const duplicate = this.beforeUploadFiles.some(
              (file) => file.name === files[i].name
            )
            if (duplicate) {
              this.duplicateFileNames.push(files[i].name)
            }
          }

          // Add new files to beforeUploadFiles if they are not duplicates and meet size criteria
          for (let i = 0; i < files.length; i++) {
            if (
              !this.duplicateFileNames.includes(files[i].name) &&
              files[i].size < this.maxFileSizeBytes &&
              this.beforeUploadFiles.length < 10
            ) {
              this.beforeUploadFiles.unshift(files[i])
            }
          }
        } else {
          // If beforeUploadFiles is empty, add files that meet size criteria
          for (let i = 0; i < files.length; i++) {
            if (
              files[i].size < this.maxFileSizeBytes &&
              this.beforeUploadFiles.length < 10
            ) {
              this.beforeUploadFiles.push(files[i])
            }
          }
        }
        this.uploadFiles(files)
      }
    }
  }

  detectFiles(event: any) {
    let files = event.target.files

    if (this.beforeUploadFiles.length > 0) {
      // Check for duplicates and populate duplicateFileNames array
      files.forEach((item) => {
        const duplicate = this.beforeUploadFiles.some(
          (file) => file.name === item.name
        )
        if (duplicate) {
          this.duplicateFileNames.push(item.name)
        }
      })

      // Add new files to beforeUploadFiles if they are not duplicates and meet size criteria
      files.forEach((item) => {
        if (
          !this.duplicateFileNames.includes(item.name) &&
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

    // Call uploadFiles with the files array
    this.uploadFiles(files)
  }

  async removeUpload(upload: Upload) {
    this.deleteFailed = false
    const deleted = await this.uploadService.cancelJobAttachmentUpload(
      this.job.id,
      upload
    )
    if (deleted) {
      this.duplicateFileNames = this.duplicateFileNames.filter(
        (file) => file !== upload.name
      )
      this.uploadedFiles = this.uploadedFiles.filter((file) => file !== upload)
    } else {
      this.deleteFailed = true
      this.messageService.clear()
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: `Something went while wrong deleting your file.`,
      })
    }

    this.beforeUploadFiles = []
    this.beforeUploadFiles.push(...this.uploadedFiles)
  }

  stripHtmlTagslength(html: string): number {
    const div = document.createElement('div')
    div.innerHTML = html
    if (div.textContent.length > 5 && div.textContent.length < 2500) {
      this.bidMessageValidated = false
    } else {
      this.bidMessageValidated = true
    }
    return div.textContent.length
  }

  updateDialogDeleteJob(event: Event) {
    event.stopPropagation()
    this.visibleDeleteModal = !this.visibleDeleteModal
  }

  async withdrawProposal(event: Event) {
    event.stopPropagation()
    this.visibleWithdrawModal = !this.visibleWithdrawModal
    if (!this.visibleWithdrawModal) {
      const chosen = await this.publicJobsService.declineBid(
        this.job,
        this.yourApplication
      )
      if (chosen) {
        this.visibleWithdrawSuccessModal = true
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Something went wrong with withdrawing your application.`,
        })
      }
    }
  }

  updateDialogWithdrawProposal(event: Event) {
    event.stopPropagation()
    this.visibleWithdrawModal = !this.visibleWithdrawModal
  }

  // Login Part
  onFirebaseLogin(signInSuccessData: FirebaseUISignInSuccessWithAuthResult) {
    this.loading = true
    if (isPlatformBrowser(this.platformId)) this.spinner.hide()
    const user = signInSuccessData.authResult.user
    const rnd = Math.floor(Math.random() * 109) + 1
    const parsedUser = new User({
      '@context': 'http://schema.org',
      '@type': 'Person',
      name: user['displayName'] || 'Empty',
      address: user['uid'],
      avatar: {
        uri: user['photoURL'] || `assets/img/animals/${rnd}.png`,
      },
      email: user['email'] || 'Empty',
      phone: user['phoneNumber'] || 'Empty',
      state: user['state'] || 'Empty',
      whitelisted: user['whitelisted'] || false,
      whitelistRejected: user['whitelistRejected'] || false,
      whitelistSubmitted: user['whitelistSubmitted'] || false,
      verified: user['verified'] || false,
    })

    this.handleLogin(parsedUser)
  }

  async handleLogin(userDetails: User) {
    let user: User
    try {
      user = await this.userService.getOwnUser(userDetails.address)
    } catch (error) {
      console.error(
        `! failed to query for user with address: [${userDetails.address}] error was: `,
        error
      )
    }

    if (user && user.address) {
      //console.log('+ logging existing user in:', user.email)
      ;(await this.afAuth.currentUser)
        .getIdToken(/* forceRefresh */ true)
        .then((idToken) => {
          window.sessionStorage.accessToken = idToken
        })
        .catch((error) => {
          console.error('! jwt token was not stored in session storage ', error)
          alert('Sorry, we encountered an unknown error')
        })
      this.authService.setUser(user)

      if (this.route.snapshot.queryParams['nextAction'])
        this.updateVisibleLoginModal()
      else this.updateVisibleLoginModal()
    } else {
      this.initialiseUserAndRedirect(userDetails)
    }
  }

  async initialiseUserAndRedirect(user: User) {
    //console.log(`initialise`)
    this.userService.saveUser(user).then(
      (res) => {
        this.authService.setUser(user)
        this.router.navigate(['/profile/setup'])
      },
      (err) => {
        console.log('onLogin - err', err)
      }
    )
  }

  updateVisibleLoginModal() {
    this.visibleLoginModal = !this.visibleLoginModal
  }

  // job-status-panel
  statusLeftClick(event: Event) {
    event.stopPropagation()
    if (this.currentUser) {
      this.visibleDeleteModal = !this.visibleDeleteModal
    } else {
      this.visibleLoginModal = !this.visibleLoginModal
    }
  }
}
