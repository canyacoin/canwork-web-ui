import {
  Component,
  NgModule,
  OnDestroy,
  OnInit,
  Pipe,
  PipeTransform,
  HostBinding,
  Directive,
} from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'

import { Observable, Subscription } from 'rxjs'

import {
  Job,
  JobDescription,
  PaymentType,
  TimeRange,
  WorkType,
  JobState,
} from '../../../core-classes/job'
import { User, UserType } from '../../../core-classes/user'
import { AuthService } from '@service/auth.service'
import { JobService } from '@service/job.service'
import { PublicJobService } from '@service/public-job.service'
import { MobileService } from '@service/mobile.service'
import { UserService } from '@service/user.service'

interface jobType {
  label: string
  code: string
}

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
  publicJobs: Job[]
  activeJobs: Job[]
  draftJobs: Job[]
  completeJobs: Job[]
  jobsSubscription: Subscription
  publicJobsSubscription: Subscription
  authSub: Subscription
  loading = true
  jobType = 'active'
  allJobs: Job[]
  searchQuery: string

  jobTypes: jobType[]
  selectedjob: jobType

  currentPage: number = 0
  first: number = 0
  totalRecords: number = 0
  rows: number = 5

  filters: SortingMethod[] | undefined

  selectedFilter: SortingMethod | undefined

  sortByList: SortingMethod[] | undefined
  selectedSortBy: SortingMethod | undefined

  filteredJobs: Job[] | undefined

  constructor(
    private authService: AuthService,
    public mobile: MobileService,
    //private orderPipe: OrderPipe,
    private jobService: JobService,
    private publicJobService: PublicJobService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router //public filterPipe: FilterPipe
  ) {}

  async ngOnInit() {
    this.jobTypes = [
      { label: 'Active Jobs', code: 'active' },
      { label: 'Public Jobs', code: 'public' },
      { label: 'Direct Jobs', code: 'direct' },
      { label: 'Drafts', code: 'draft' },
      { label: 'Completed Jobs', code: 'completed' },
    ]

    this.filters = [
      { name: 'All Jobs', code: '' },
      { name: 'Jobs Awaiting Escrow', code: 'Awaiting Escrow' },
      { name: 'Funds In Escrow', code: 'Funds In Escrow' },
      { name: 'Jobs Pending completion', code: 'Pending completion' },
      { name: 'Jobs in Disputed', code: 'Disputed' },
      { name: 'Pending Jobs', code: 'Offer pending' },
      { name: 'Cancelled', code: 'Cancelled' },
    ]
    this.sortByList = [
      { name: 'Date Posted', code: 'newest' },
      { name: 'Project Name', code: 'projectName' },
      { name: 'Budget', code: 'budget' },
    ]

    this.selectedFilter = this.filters[0]
    this.selectedSortBy = this.sortByList[0]

    this.route.queryParams.subscribe((params) => {
      if (params['tab'] == undefined) {
        this.selectedjob = this.jobTypes[0]
        this.jobType = this.jobTypes[0].code
      } else {
        this.selectedjob = this.jobTypes[params['tab']]
        this.jobType = this.selectedjob.code
      }
    })

    this.currentUser = await this.authService.getCurrentUser()
    // this.userType = this.currentUser.type
    // we changed the logic here, we need client mode for getting active jobs.
    this.userType = UserType.client
    await this.initialiseJobs(this.currentUser.address, this.userType)
  }

  ngOnDestroy() {
    if (this.jobsSubscription) {
      this.jobsSubscription.unsubscribe()
    }
  }

  private async initialiseJobs(userId: string, userType: UserType) {
    this.jobsSubscription = this.jobService
      .getJobsByUser(userId, userType)
      .subscribe(async (result: Job[]) => {
        let jobs: Job[] = result

        jobs = jobs.sort(
          (a, b) => b.actionLog[0].timestamp - a.actionLog[0].timestamp
        )

        this.activeJobs = jobs
        this.loading = false
        this.jobs = jobs
        this.jobs.forEach(async (job) => {
          this.jobService.assignOtherPartyAsync(job, this.userType)
        })
        this.showFilteredJobs(this.jobs)
      })
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
    this.showFilteredJobs(this.jobs)
  }

  showFilteredJobs(jobs: Job[]): void {
    this.totalRecords = jobs.length

    // 5 item each page
    this.filteredJobs = jobs.slice(
      this.currentPage * 5,
      this.currentPage * 5 + 5
    )
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

  SortbyFilter(filter: string) {
    console.log('this.jobs:', this.jobs)
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
}
