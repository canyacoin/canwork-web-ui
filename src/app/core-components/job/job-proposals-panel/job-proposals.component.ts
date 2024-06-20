import { Component, OnInit, Directive } from '@angular/core'
import { Bid, Job, JobState } from '@class/job'
import { User } from '@class/user'
import { ActivatedRoute, Router } from '@angular/router'
import { AuthService } from '@service/auth.service'
import { PublicJobService } from '@service/public-job.service'
import { UserService } from '@service/user.service'
import { Subscription } from 'rxjs'
import { take } from 'rxjs/operators'
import { MessageService } from 'primeng/api'

interface SortingMethod {
  name: string
  code: string
}

@Component({
  selector: 'job-proposals',
  templateUrl: './job-proposals.component.html',
})
export class JobProposalsPanelComponent implements OnInit {
  authSub: Subscription
  bidsSub: Subscription
  currentUser: User
  bids: Bid[] = []
  jobId: string
  job: Job
  isOpen: boolean
  jobSub: Subscription
  canSee = false
  rating = 3

  sortbylist: SortingMethod[] | undefined
  selectedsortby: SortingMethod | undefined

  selectedBid: Bid
  visibleProposalDetails: boolean = false

  visibleAcceptModal: boolean = false
  selectedBidContent: string = ''

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private userService: UserService,
    private publicJobsService: PublicJobService,
    private router: Router,
    private messageService: MessageService
  ) {}

  async ngOnInit() {
    this.sortbylist = [
      { name: 'Newest', code: 'newest' },
      { name: 'Budget', code: 'budget' },
    ]

    this.selectedsortby = this.sortbylist[0]

    this.authSub = this.authService.currentUser$.subscribe((user: User) => {
      this.currentUser = user
    })
    this.activatedRoute.params.pipe(take(1)).subscribe((params) => {
      if (params['jobId']) {
        this.jobSub = this.publicJobsService
          .getPublicJob(params['jobId'])
          .subscribe((publicJob) => {
            if (
              this.currentUser &&
              this.currentUser.address === publicJob.clientId
            ) {
              this.job = publicJob
              this.isOpen = this.job.state === JobState.acceptingOffers
              this.jobId = params['jobId']
              this.canSee = true
              this.bidsSub = this.publicJobsService
                .getPublicJobBids(publicJob.id)
                .subscribe((result) => {
                  this.bids = result
                  // console.log('this.bid', this.bids)
                })
            } else {
              this.canSee = false
              this.bids = []
            }
          })
      } else if (params['slug']) {
        this.jobSub = this.publicJobsService
          .getPublicJobBySlug(params['slug'])
          .subscribe((publicJob) => {
            // console.log(publicJob === null)
            if (publicJob === null) {
              this.canSee = false
              this.bids = []
            } else {
              if (this.currentUser.address === publicJob.clientId) {
                this.job = publicJob
                this.isOpen = this.job.state === JobState.acceptingOffers
                this.jobId = params['jobId']
                this.canSee = true
                this.bidsSub = this.publicJobsService
                  .getPublicJobBids(publicJob.id)
                  .subscribe((result) => {
                    this.bids = result
                    // console.log('this.bid', this.bids)
                  })
              } else {
                this.canSee = false
                this.bids = []
              }
            }
          })
      }
    })
  }

  /*
  // obsolete, Oct 23
  async getProviderData(id) {
    const provider = await this.userService.getUser(id)
    return provider
  }
  */
  ShowDialogDetail(bid: Bid) {
    console.log('this.selectedBid', bid)

    this.selectedBid = bid
    this.visibleProposalDetails = true
  }
  SortbyFilter() {
    this.bids = this.bids.sort((a, b) => {
      if (this.selectedsortby.code === 'newest') {
        return b.timestamp - a.timestamp
      } else if (this.selectedsortby.code === 'budget') {
        return b.budget - a.budget
      }
    })
  }

  async declineProvider(selectedBid: any) {
    const bid = selectedBid
    const confirmed = confirm(
      "Are you sure you want to decline this provider's offer?"
    )
    if (confirmed) {
      const chosen = await this.publicJobsService.declineBid(this.job, bid)
      if (chosen) {
        const client = await this.userService.getUser(this.job.clientId)
        this.publicJobsService.notifyLosers(this.job, client, [bid])
      } else {
        alert('Something went wrong. please try again later')
      }
    }
  }

  stripHtmlTags(html: string): string {
    // Create a new DOM element to use the browser's parsing capabilities
    const div = document.createElement('div')

    // Assign the HTML string to the innerHTML of the created element
    div.innerHTML = html

    // Use the textContent property to get the plain text without HTML tags
    return div.textContent || div.innerText || ''
  }
  async chooseProvider(selectedBid: any) {
    const noAddress = await this.authService.isAuthenticatedAndNoAddress()
    if (noAddress) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Add BNB Chain (BEP20) wallet to Accept Offer.',
      })
      return
    }

    const bid = selectedBid
    const chosen = await this.publicJobsService.closePublicJob(this.job, bid)
    if (chosen) {
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Bid successfully accepted.',
      })

      const losingBids = this.bids.find(
        (item) => item.providerId !== selectedBid.providerId
      )

      const client = await this.userService.getUser(this.job.clientId)
      this.publicJobsService.notifyLosers(this.job, client, losingBids)
      this.router.navigate(['/inbox/job', this.job.id])
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Something went wrong. please try again later',
      })
    }
  }

  capitalizeName(name: string): string {
    return name
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  updateDialogAcceptJob(event: Event) {
    event.stopPropagation()
    this.visibleProposalDetails = false
    this.selectedBidContent =
      'Accept ' +
      // @ts-ignore
      (this.capitalizeName(this.selectedBid.providerInfo?.name) || '') +
      "'s bid means you have decided to continue and hire him for your work."
    this.visibleAcceptModal = !this.visibleAcceptModal
  }
}
