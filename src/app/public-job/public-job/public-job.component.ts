import { Component, OnInit, OnDestroy, Directive } from '@angular/core'
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'

import * as moment from 'moment'

import { Bid, Job, JobState } from '@class/job'
import { User } from '@class/user'
import { AuthService } from '@service/auth.service'
import { PublicJobService } from '@service/public-job.service'
import { UserService } from '@service/user.service'
//import { AngularFireStorage } from '@angular/fire/storage'
import { AngularFireStorage } from '@angular/fire/compat/storage'
import { AngularEditorConfig } from '@kolkov/angular-editor'
import { Subscription } from 'rxjs'
import { take } from 'rxjs/operators'
import { environment } from '@env/environment'
import { NgxSpinnerService } from 'ngx-spinner'
import { Upload } from '@class/upload'
import { ToastrService } from 'ngx-toastr'
import { UploadService } from '@service/upload.service'

import { providerTypeArray } from 'app/shared/constants/providerTypes'

import { AngularFireAuth } from '@angular/fire/compat/auth'
import { FirebaseUISignInSuccessWithAuthResult } from 'firebaseui-angular'

declare var $: any

interface sharelinkstype {
  name: string
  img: string
  code: string
}

@Component({
  selector: 'app-public-job',
  templateUrl: './public-job.component.html',
})
export class PublicJobComponent implements OnInit, OnDestroy {
  bidForm: UntypedFormGroup = null
  bids: any[]
  recentBids: any
  authSub: Subscription
  routeSub: Subscription
  bidsSub: Subscription
  jobSub: Subscription
  jobExists: boolean
  canBid: boolean
  sent = false
  canSee = false
  hideDescription = false
  myJob = false
  loading = true
  shareableLink: string
  link: string
  job: Job
  currentUser: User
  hasCurrentUser: boolean = false
  jobPoster: any = null
  jobFromNow: string = ''

  IsShownTab: boolean = false

  sharelinks: sharelinkstype[] | undefined
  selectedsharelinks: sharelinkstype | undefined
  activejobTypes: any[]
  selectedjob: any

  price_bid: number = 0
  hoveredFiles: boolean = false
  IsProvider: boolean = false

  providerTypeArray = providerTypeArray
  // new feature files upload

  beforeuploadFiles: any[] = []
  currentUploadNumber: number = 0
  uploadedFiles: Upload[] = []

  currentUpload: Upload
  maxFileSizeBytes = 50000000 // 50mb
  fileTooBig = false
  uploadFailed = false
  deleteFailed = false

  // Your application

  yourApplication: any

  bid_message_valiated: boolean = true
  price_validate: boolean = false

  visible_delete_modal: boolean = false
  visible_withdraw_modal: boolean = false
  visible_login_modal: boolean = false
  visible_listing_modal: boolean = false

  coverletterConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '200px',
    minHeight: '5',
    maxHeight: '2500',
    width: 'auto',
    minWidth: '0',
    translate: 'yes',
    enableToolbar: true,
    showToolbar: true,
    placeholder: 'How do you intend to deliver on this job',
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

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private userService: UserService,
    private publicJobsService: PublicJobService,
    private storage: AngularFireStorage,
    private formBuilder: UntypedFormBuilder,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private uploadService: UploadService,
    private route: ActivatedRoute,
    private router: Router,
    private afAuth: AngularFireAuth
  ) {
    this.bidForm = this.formBuilder.group({
      price: [
        '',
        Validators.compose([
          Validators.required,
          Validators.min(1),
          Validators.max(10000000),
          Validators.pattern('^[0-9]*$'),
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
    this.spinner.show()

    setTimeout(() => {
      /** spinner ends after 2 seconds */
      this.spinner.hide()
    }, 2000)
    this.activejobTypes = [
      { label: 'Job Details', code: 'jobsdetail' },
      { label: 'Proposals', code: 'proposals' },
    ]
    this.selectedjob = this.activejobTypes[0]

    this.sharelinks = [
      { name: 'Invite Freelancer', img: 'fi_user-plus.svg', code: '1' },
      { name: 'Copy Link', img: 'u_link.svg', code: '2' },
      { name: 'Twitter', img: 'x.svg', code: '3' },
      { name: 'Facebook', img: 'logos_facebook.svg', code: '4' },
      { name: 'Linkedin', img: 'devicon_linkedin.svg', code: '5' },
    ]

    this.selectedsharelinks = this.sharelinks[0]

    this.shareableLink = environment.shareBaseUrl
    this.activatedRoute.params.pipe(take(1)).subscribe((params) => {
      if (params['jobId']) {
        this.jobSub = this.publicJobsService
          .getPublicJob(params['jobId'])
          .subscribe((publicJob) => {
            if (publicJob === undefined) {
              this.jobExists = false
              this.canSee = false
              this.loading = false
            } else {
              this.job = publicJob
              this.initJob(this.job)

              this.bidsSub = this.publicJobsService
                .getPublicJobBids(params['jobId'])
                .subscribe((result) => {
                  this.bids = result || []

                  if (this.bids.length > 3) {
                    this.recentBids = this.bids.slice(0, 3)
                  } else {
                    this.recentBids = this.bids
                  }
                })
            }
          })
      } else if (params['slug']) {
        this.jobSub = this.publicJobsService
          .getPublicJobBySlug(params['slug'])
          .subscribe((publicJob) => {
            if (publicJob === null) {
              this.jobExists = false
              this.canSee = false
              this.loading = false
            } else {
              this.job = publicJob as Job
              this.initJob(this.job)

              this.bidsSub = this.publicJobsService
                .getPublicJobBids(publicJob.id)
                .subscribe((result) => {
                  this.bids = result || []
                  if (this.currentUser) {
                    this.bids.map((bid) => {
                      if (bid.providerId === this.currentUser.address) {
                        this.yourApplication = bid
                      }
                    })
                  }

                  if (this.bids.length > 3) {
                    this.recentBids = this.bids.slice(0, 3)
                  } else {
                    this.recentBids = this.bids
                  }
                })
            }
          })
      }
    })
    this.authSub = this.authService.currentUser$.subscribe((user: User) => {
      if (user) {
        this.currentUser = user
      }
    })
    this.IsShownTab = this.currentUser && this.IsProvider
  }

  async uploadFiles(files: FileList) {
    this.uploadFailed = false
    this.fileTooBig = false

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.size > this.maxFileSizeBytes) {
        this.fileTooBig = true
        this.toastr.error(`File ${file.name} is too big.`)
        this.beforeuploadFiles.slice(i, 1)
        continue
      }

      try {
        const currentUpload = new Upload(
          this.currentUser.address,
          file.name,
          file.size
        )

        this.currentUploadNumber++

        const upload: Upload =
          await this.uploadService.uploadJobAttachmentToStorage(
            this.job.id,
            currentUpload,
            file
          )
        if (upload) {
          this.uploadedFiles.unshift(upload)
        } else {
          this.uploadFailed = true
          this.toastr.error(`Failed to upload file ${file.name}.`)
        }
      } catch (e) {
        this.uploadFailed = true
        this.toastr.error(`Failed to upload file ${file.name}.`)
      }
    }

    this.beforeuploadFiles = []
    this.beforeuploadFiles.push(...this.uploadedFiles)
  }
  changeJob(item: any) {
    this.selectedjob = item
  }
  ngOnDestroy() {
    if (this.bidsSub) {
      this.bidsSub.unsubscribe()
    }
    this.jobSub.unsubscribe()
    this.authSub.unsubscribe()
  }

  async setClient(clientId) {
    /*
    new one, retrieve user only once (if not already retrieved)
    and use the new fastest Algolia getUserById service version
    */

    if (!this.jobPoster) {
      this.jobPoster = await this.userService.getUser(clientId)

      if (this.jobPoster) {
        let avatar = this.jobPoster.avatar // current, retrocomp
        //console.log(result[i])
        if (
          this.jobPoster.compressedAvatarUrl &&
          this.jobPoster.compressedAvatarUrl != 'new'
        ) {
          // keep same object structure
          // use compress thumbed if exist and not a massive update (new)
          avatar = {
            uri: this.jobPoster.compressedAvatarUrl,
          }
        }
        this.jobPoster.avatarUri = avatar.uri
      }
    }
    // old
    // this.jobPoster = await this.userService.getUser(clientId)
  }

  async initJob(job: Job) {
    this.jobExists = true
    this.jobFromNow = moment(job.createAt).fromNow()
    if (this.currentUser) {
      this.myJob = job.clientId === this.currentUser.address
      await this.setClient(this.job.clientId)

      if (this.currentUser.type === 'Provider') {
        this.IsProvider = true
        const check = await this.publicJobsService.canBid(
          this.currentUser.address,
          this.job
        )
        this.canBid = check
      }
      if (
        this.canBid &&
        this.currentUser.bscAddress &&
        this.currentUser.type === 'Provider' &&
        !this.myJob &&
        this.isOpen &&
        this.activatedRoute.snapshot.queryParams['nextAction'] === 'bid'
      )
        $('#bidModal').modal('show')
    } else {
      this.IsProvider = false
      this.myJob = false
    }
    if (job.draft && !this.myJob) {
      // only allow the job creator to see jobs in draft state
      this.canSee = false
    } else {
      this.canSee = true
    }
    this.setAttachmentUrl()
  }

  getCategoryName(providerType: string) {
    const category = this.providerTypeArray.find((c) => c.id === providerType)
    return category.title
  }
  async cancelJob(event: Event) {
    event.stopPropagation()
    this.visible_delete_modal = !this.visible_delete_modal

    if (this.myJob) {
      const updated = await this.publicJobsService.cancelJob(this.job.id)
      if (updated) {
        this.job.state = JobState.closed
      }
    }
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

  get isOpen() {
    return this.job.state === JobState.acceptingOffers
  }

  get isClosed() {
    return this.job.state === JobState.closed
  }

  async submitBid() {
    if (
      this.bidForm.value.message.length < 5 &&
      this.bidForm.value.message.length > 2500
    ) {
      this.bid_message_valiated = true
      return
    }
    if (this.bidForm.value.price <= 0) {
      this.price_validate = true
      return
    }

    this.spinner.show()

    const providerInfo = {
      name: this.currentUser.name,
      skillTags: this.currentUser.skillTags,
      title: this.currentUser.title,
      timezone: this.currentUser.timezone,
      avatar: this.currentUser.avatar,
    }

    // Test
    if (this.currentUser.whitelisted) {
      const bidToSubmit = new Bid(
        this.currentUser.address,
        providerInfo,
        this.bidForm.value.price,
        this.bidForm.value.message,
        Date.now(),
        this.uploadedFiles ? this.uploadedFiles : []
      )
      this.sent = await this.publicJobsService.handlePublicBid(
        bidToSubmit,
        this.job
      )
      this.spinner.hide()
      this.canBid = false
    } else {
      this.spinner.hide()
      alert('You have not been approved as a provider.')
    }
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
    document.getElementById('copied').style.display = 'block'
    setTimeout(function () {
      document.getElementById('copied').style.display = 'none'
    }, 2000)
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
    if (event.dataTransfer && event.dataTransfer.files) {
      if (
        this.currentUploadNumber > 10 ||
        event.dataTransfer.files.length > 10
      ) {
        this.uploadFailed = true
        return
      }

      if (event.dataTransfer && event.dataTransfer.files) {
        for (let i = 0; i < event.dataTransfer.files.length; i++) {
          if (this.beforeuploadFiles.length > 0) {
            this.beforeuploadFiles.unshift(event.dataTransfer.files[i])
          } else {
            this.beforeuploadFiles.push(event.dataTransfer.files[i])
          }
        }
      }
      const files = event.dataTransfer.files
      this.uploadFiles(files)
    }
  }
  detectFiles(event: any) {
    const files = event.target.files
    if (this.currentUploadNumber > 10 || files.length > 10) {
      this.uploadFailed = true
      return
    }
    if (this.beforeuploadFiles.length > 0) {
      this.beforeuploadFiles.unshift(...files)
    } else {
      this.beforeuploadFiles = files
    }

    this.uploadFiles(files)
  }

  stripHtmlTagslength(html: string): number {
    const div = document.createElement('div')
    div.innerHTML = html
    if (div.textContent.length > 5 && div.textContent.length < 2500) {
      this.bid_message_valiated = false
    } else {
      this.bid_message_valiated = true
    }
    return div.textContent.length
  }

  updateDialog(event: Event) {
    event.stopPropagation()
    this.visible_delete_modal = !this.visible_delete_modal
  }

  WithdrawJob(event: Event) {
    event.stopPropagation()
    this.visible_withdraw_modal = !this.visible_withdraw_modal
    if (!this.visible_withdraw_modal) {
      this.visible_listing_modal = true
    }
  }

  updatedDialogWithdrawJob(event: Event) {
    event.stopPropagation()
    this.visible_withdraw_modal = !this.visible_withdraw_modal
  }
  // Login Part

  onFirebaseLogin(signInSuccessData: FirebaseUISignInSuccessWithAuthResult) {
    this.loading = true
    this.spinner.hide()
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
        this.updateVisibleloginModal()
      else this.updateVisibleloginModal()
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

  updateVisibleloginModal() {
    this.visible_login_modal = !this.visible_login_modal
  }
}
