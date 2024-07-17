import { Component, OnDestroy, OnInit } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'

import { Observable, Subscription } from 'rxjs'
import { mergeMap } from 'rxjs/operators'

import { Job, PaymentType, JobState } from '@class/job'
import { User, UserType } from '../../../core-classes/user'
import { AuthService } from '@service/auth.service'
import { JobService } from '@service/job.service'
import { PublicJobService } from '@service/public-job.service'
import { MobileService } from '@service/mobile.service'
import { Tab } from '@class/tabs'
import { Bid } from '@class/job'

interface PageEvent {
  first: number
  rows: number
  page: number
  pageCount: number
}

interface SortingMethod {
  name: string
  code: string
}

@Component({
  selector: 'app-job-dashboard',
  templateUrl: './job-dashboard.component.html',
})
export class JobDashboardComponent implements OnInit, OnDestroy {
  currentUser: User

  userType: UserType
  paymentType = PaymentType
  jobs: Job[] = []
  publicJobs: Job[] = []
  activeJobs: Job[] = []
  submittedJobs: Job[] = []
  draftJobs: Job[] = []
  completeJobs: Job[] = []
  jobsSubscription: Subscription
  publicJobsSubscription: Subscription
  authSub: Subscription
  loading = true
  jobType = 'active'
  allJobs: Job[]
  searchQuery: string

  jobTypes: Tab[]
  selectedJob: Tab

  currentPage: number = 0
  first: number = 0
  totalRecords: number = 0
  rows: number = 5

  filters: SortingMethod[] | undefined

  selectedFilter: SortingMethod | undefined

  sortByList: SortingMethod[] | undefined
  selectedSortBy: SortingMethod | undefined

  filteredJobs: Job[] | undefined

  visibleDeletedSuccessModal: boolean = false

  searchInput: string = ''

  constructor(
    private authService: AuthService,
    public mobile: MobileService,
    private jobService: JobService,
    private publicJobService: PublicJobService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    this.filters = [
      { name: 'All Jobs', code: '' },
      {
        name: 'Jobs Awaiting Escrow',
        code: JobState.termsAcceptedAwaitingEscrow,
      },
      { name: 'Funds In Escrow', code: JobState.inEscrow },
      { name: 'Jobs Pending completion', code: JobState.workPendingCompletion },
      { name: 'Jobs in Disputed', code: JobState.inDispute },
      { name: 'Pending Jobs', code: JobState.offer },
      { name: 'Cancelled', code: JobState.cancelled },
    ]
    this.sortByList = [
      { name: 'Date Posted', code: 'newest' },
      { name: 'Project Name', code: 'projectName' },
      { name: 'Budget', code: 'budget' },
    ]

    this.selectedFilter = this.filters[0]
    this.selectedSortBy = this.sortByList[0]

    this.currentUser = await this.authService.getCurrentUser()
    // this.userType = await this.authService.getCurrentUserType()
    // Subscribe to userType changes
    this.authService.userType$.subscribe((userType) => {
      this.userType = userType
      this.onUserTypeChange()
    })
    console.log('current User:', this.userType)

    // this.userType = this.currentUser.type
    // we changed the logic here, we need client mode for getting active jobs.
    // this.userType = UserType.client
    await this.initialiseJobs(this.currentUser.address, this.userType)
  }

  ngOnDestroy() {
    if (this.jobsSubscription) {
      this.jobsSubscription.unsubscribe()
    }
  }

  private async initialiseJobs(userId: string, userType: UserType) {
    this.jobs = []
    if (userType === UserType.client) {
      this.jobTypes = [
        { label: 'Active Jobs', code: 'active' },
        { label: 'Public Jobs', code: 'public' },
        { label: 'Direct Jobs', code: 'direct' },
        { label: 'Drafts', code: 'draft' },
        { label: 'Completed Jobs', code: 'completed' },
      ]
    } else {
      this.jobTypes = [
        { label: 'Active Jobs', code: 'active' },
        { label: 'Submitted Jobs', code: 'submitted' },
      ]
    }

    this.route.queryParams.subscribe((params) => {
      if (params['tab'] == undefined) {
        this.selectedJob = this.jobTypes[0]
        this.jobType = this.jobTypes[0].code
      } else {
        let tabIndex = params['tab']
        // console.log('tabIndex: ', tabIndex)
        if (userType === UserType.provider && tabIndex > 1) {
          this.selectedJob = this.jobTypes[1]
        } else {
          this.selectedJob = this.jobTypes[tabIndex]
        }
        this.jobType = this.selectedJob.code
      }
    })

    this.searchInput = ''
    // console.log('this,jobType: ', this.jobType)

    this.jobsSubscription = this.jobService
      .getJobsByUser(userId, userType)
      .subscribe(async (result: Job[]) => {
        let jobs: Job[] = result

        jobs = jobs.sort(
          (a, b) => b.actionLog[0].timestamp - a.actionLog[0].timestamp
        )

        // console.log(
        //   '==========================================> activeJobs',
        //   jobs
        // )

        this.activeJobs = jobs
        this.activeJobs.forEach(async (job) => {
          this.jobService.assignOtherPartyAsync(job, this.userType)
        })
        this.loading = false
        this.jobs = this.activeJobs
        this.showFilteredJobs(this.jobs)
      })
    if (userType === UserType.client) {
      this.publicJobsSubscription = this.publicJobService
        .getPublicJobsByUser(userId)
        .subscribe(async (result: Job[]) => {
          // only show open jobs
          let jobs: Job[] = result

          jobs = jobs.sort(
            (a, b) => b.actionLog[0].timestamp - a.actionLog[0].timestamp
          )

          this.publicJobs = jobs.filter(
            (job) => job.state === JobState.acceptingOffers
          )
          this.draftJobs = jobs.filter(
            (job) => job.draft === true && job.state !== JobState.closed
          )
          this.completeJobs = jobs.filter(
            (job) => job.state === JobState.complete
          )

          switch (this.jobType) {
            case 'active':
              this.jobs = this.activeJobs
              break
            case 'public':
              this.jobs = this.publicJobs.filter(
                (job) => job.visibility === 'public' && job.draft === false
              )
              break
            case 'direct':
              this.jobs = this.publicJobs.filter(
                (job) => job.visibility === 'invite' && job.draft === false
              )
              break
            case 'draft':
              this.jobs = this.draftJobs
              break
            case 'completed':
              this.jobs = this.completeJobs
              break
          }
          this.showFilteredJobs(this.jobs)
        })
    } else {
      this.publicJobsSubscription = this.publicJobService
        .getAllOpenJobs()
        .subscribe(async (result: Job[]) => {
          this.submittedJobs = []
          for (const publicJob of result) {
            this.publicJobService
              .getPublicJobBids(publicJob.id)
              .subscribe((result: Bid[]) => {
                if (this.currentUser) {
                  let isApplied = result.find(
                    (bid) => bid.providerId === this.currentUser.address
                  )
                  if (isApplied) this.submittedJobs.push(publicJob)
                }
              })
          }

          // console.log('=====>', this.submittedJobs)

          switch (this.jobType) {
            case 'active':
              this.jobs = this.activeJobs
              break
            case 'submitted':
              this.jobs = this.submittedJobs
              // console.log('submitted-this.jobs===========>', this.jobs)
              break
          }
          this.showFilteredJobs(this.jobs)
        })
    }
  }

  changeJob(code: string) {
    this.jobType = code
    let numberTab = 0
    switch (code) {
      case 'active':
        this.jobs = this.activeJobs
        this.selectedFilter = this.filters[0]
        numberTab = 0
        break
      case 'submitted':
        this.jobs = this.submittedJobs
        numberTab = 1
        break
      case 'public':
        this.jobs = this.publicJobs.filter(
          (job) => job.visibility === 'public' && job.draft === false
        )
        numberTab = 1
        break
      case 'direct':
        this.jobs = this.publicJobs.filter(
          (job) => job.visibility === 'invite' && job.draft === false
        )
        numberTab = 2
        break
      case 'draft':
        this.jobs = this.draftJobs
        numberTab = 3
        break
      case 'completed':
        this.jobs = this.completeJobs
        numberTab = 4
        break
    }
    this.router.navigate(['/inbox/jobs'], { queryParams: { tab: numberTab } })
    this.searchInput = ''
    this.showFilteredJobs(this.jobs)
  }

  showFilteredJobs(jobs: Job[]): void {
    if (jobs) {
      // console.log('===========================>       jobs:', jobs)
      // search Jobs
      let resultJobs: Job[] = jobs
      if (this.searchInput !== '') {
        resultJobs = jobs.filter((job) => {
          return (
            job.information.title
              .toLowerCase()
              .includes(this.searchInput.toLowerCase()) ||
            job.information.description
              .toLowerCase()
              .includes(this.searchInput.toLowerCase()) ||
            job?.otherParty?.name
              .toLowerCase()
              .includes(this.searchInput.toLowerCase())
          )
        })
      }

      // console.log('resultJobs:', resultJobs)

      this.totalRecords = resultJobs.length
      // 5 item each page
      this.filteredJobs = resultJobs.slice(
        this.currentPage * 5,
        this.currentPage * 5 + 5
      )
    }
  }

  viewJobDetails(jobId: string): void {
    this.router.navigate(['/inbox/job', jobId])
  }

  filterJobsByState(state: string) {
    if (state !== '') {
      this.jobs = this.activeJobs.filter((job) => job.state === state)
    } else {
      this.jobs = this.activeJobs
    }
    this.showFilteredJobs(this.jobs)
  }

  onPageChange(e: PageEvent) {
    this.first = e.first
    this.rows = e.rows // this is injected from parent
    this.currentPage = e.page // set new page position
    this.showFilteredJobs(this.jobs)
  }

  sortbyFilter(filter: string) {
    // console.log('this.jobs:', this.jobs)
    this.jobs = this.jobs.sort((a, b) => {
      if (filter === 'newest') {
        return b.actionLog[0].timestamp - a.actionLog[0].timestamp
      } else if (filter === 'projectName') {
        return a.information.title.localeCompare(b.information.title)
      } else if (filter === 'budget') {
        return b.budget - a.budget
      }
    })
    this.showFilteredJobs(this.jobs)
  }

  showDeletedSuccessModal(event: Event) {
    event.preventDefault()
    this.visibleDeletedSuccessModal = true
  }

  // This method will be called whenever the input changes
  onSearchInputChange(searchValue: string): void {
    this.searchInput = searchValue
    this.loading = true
    setTimeout(() => {
      this.loading = false
    }, 500)
    this.showFilteredJobs(this.jobs)
  }

  async onUserTypeChange() {
    // console.log('User type changed to:', this.userType)
    // Perform your desired actions here
    await this.initialiseJobs(this.currentUser.address, this.userType)
  }
}
