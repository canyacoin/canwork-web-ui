import { Component, OnInit, OnDestroy, Directive } from '@angular/core'
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { Bid, Job, JobState } from '@class/job'
import { User } from '@class/user'
import { AuthService } from '@service/auth.service'
import { PublicJobService } from '@service/public-job.service'
import { UserService } from '@service/user.service'
//import { AngularFireStorage } from '@angular/fire/storage'
import { AngularFireStorage } from '@angular/fire/compat/storage'

import { Subscription } from 'rxjs'
import { take } from 'rxjs/operators'
import { environment } from '@env/environment'
declare var $: any

@Component({
  selector: 'app-public-job',
  templateUrl: './public-job.component.html',
  styleUrls: ['./public-job.component.css'],
})
export class PublicJobComponent implements OnInit, OnDestroy {
  bidForm: UntypedFormGroup = null
  bids: []
  recentBids: any
  authSub: Subscription
  routeSub: Subscription
  bidsSub: Subscription
  jobSub: Subscription
  jobExists: boolean
  canBid: boolean
  isBidding: boolean
  sent = false
  canSee = false
  hideDescription = false
  myJob = false
  loading = true
  shareableLink: string
  link: string
  job: Job
  currentUser: User
  jobPoster: User = null

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private userService: UserService,
    private publicJobsService: PublicJobService,
    private storage: AngularFireStorage,
    private formBuilder: UntypedFormBuilder
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
        Validators.compose([Validators.min(0), Validators.maxLength(10000)]),
      ],
    })
  }

  async ngOnInit() {
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
            //console.log(publicJob === null)
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
    if (!this.jobPoster)
      this.jobPoster = await this.userService.getUserById(clientId)

    // old
    // this.jobPoster = await this.userService.getUser(clientId)
  }

  async initJob(job: Job) {
    this.jobExists = true
    if (this.currentUser) {
      this.myJob = job.clientId === this.currentUser.address
      if (this.currentUser.type === 'Provider') {
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
      this.myJob = false
    }
    if (job.draft && !this.myJob) {
      // only allow the job creator to see jobs in draft state
      this.canSee = false
    } else {
      this.canSee = true
    }
    this.setClient(this.job.clientId)
    this.setAttachmentUrl()
  }

  async cancelJob() {
    if (this.myJob) {
      const updated = await this.publicJobsService.cancelJob(this.job.id)
      if (updated) {
        this.job.state = JobState.closed
      }
    }
  }

  get isOpen() {
    return this.job.state === JobState.acceptingOffers
  }

  get isClosed() {
    return this.job.state === JobState.closed
  }

  async submitBid() {
    this.isBidding = true
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
        Date.now()
      )
      this.sent = await this.publicJobsService.handlePublicBid(
        bidToSubmit,
        this.job
      )
      this.isBidding = false
      this.canBid = false
    } else {
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
}
