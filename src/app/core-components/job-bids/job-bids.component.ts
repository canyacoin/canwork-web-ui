import { Component, OnInit, Directive } from '@angular/core'
import { JobState } from '@class/job'
import { User } from '@class/user'
import { ActivatedRoute, Router } from '@angular/router'
import { AuthService } from '@service/auth.service'
import { PublicJobService } from '@service/public-job.service'
import { UserService } from '@service/user.service'
import { ToastrService } from 'ngx-toastr'
import { Subscription } from 'rxjs'
import { take } from 'rxjs/operators'

interface SortingMethod {
  name: string
  code: string
}

@Component({
  selector: 'app-job-bids',
  templateUrl: './job-bids.component.html',
  styleUrls: ['./job-bids.component.css'],
})
export class JobBidsComponent implements OnInit {
  authSub: Subscription
  bidsSub: Subscription
  currentUser: User
  bids: any[]= []
  jobId: any
  job: any
  isOpen: boolean
  jobSub: Subscription
  canSee = false
  rating = 3

  sortbylist: SortingMethod[] | undefined
  selectedsortby: SortingMethod | undefined

  ratinglist: number[] = [1, 2, 3, 4, 5]

  selectedBid: any
  visible: boolean = false
  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private userService: UserService,
    private publicJobsService: PublicJobService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  async ngOnInit() {
    this.sortbylist = [
      { name: 'Newest', code: 'actionLog[0].timestamp' },
      { name: 'Project Name', code: 'information.title' },
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
                  console.log('this.bid', this.bids)
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
                    console.log('this.bid', this.bids)
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
ShowDialogDetail(bid:any) {
  console.log("bid", bid);
  
  this.selectedBid = bid;
  this.visible = true
}
  SortbyFilter() {
    this.bids = this.bids.sort((a, b) => {
      if (this.selectedsortby.code === 'actionLog[0].timestamp') {
        return b.actionLog[0].timestamp - a.actionLog[0].timestamp
      } else if (this.selectedsortby.code === 'information.title') {
        return a.information.title.localeCompare(b.information.title)
      } else if (this.selectedsortby.code === 'budget') {
        return b.budget - a.budget
      }
    })
  }
  async chooseProvider(selectedBid : any) {
    const noAddress = await this.authService.isAuthenticatedAndNoAddress()
    if (noAddress) {
      this.toastr.error('Add BNB Chain (BEP20) wallet to Accept Offer')
      return
    }

    const bid = selectedBid
    const confirmed = confirm('Are you sure you want to choose this provider?')
    if (confirmed) {
      const chosen = await this.publicJobsService.closePublicJob(this.job, bid)
      if (chosen) {
        alert('Provider chosen!')
        const losingBids = this.bids.find(
          (item) => item.providerId !== selectedBid.providerId
        )

        const client = await this.userService.getUser(this.job.clientId)
        this.publicJobsService.notifyLosers(this.job, client, losingBids)
        this.router.navigate(['/inbox/job', this.job.id])
      } else {
        alert('Something went wrong. please try again later')
      }
    }
  }

  async declineProvider(selectedBid:any) {
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
}
