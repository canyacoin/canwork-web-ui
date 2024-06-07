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
import { Router } from '@angular/router'
//import { FilterPipe } from 'ngx-filter-pipe'
//import { OrderPipe } from 'ngx-order-pipe'
import { ReversePipe } from 'ngx-pipes'
import { OrderByPipe } from 'ngx-pipes'

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

import { NgxPaginationModule } from 'ngx-pagination'

interface jobtypes {
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
  styleUrls: ['./job-dashboard.component.css'],
  providers: [ReversePipe, OrderByPipe],
})
export class JobDashboardComponent implements OnInit, OnDestroy {
  currentUser: User
  userType: UserType
  paymentType = PaymentType
  jobs: Job[]
  publicJobs: Job[]
  activeJobs: Job[]
  draftJobs: Job[]
  jobsSubscription: Subscription
  publicJobsSubscription: Subscription
  authSub: Subscription
  orderType: string
  reverseOrder: boolean
  loading = true
  jobType = 'active'
  filterByState: any = { state: '' }
  allJobs: Job[]
  searchQuery: string
  isOnMobile = false

  activejobTypes: jobtypes[]
  selectedjob: jobtypes

  currentPage: number = 0
  first: number = 0
  totalRecords: number = 0
  rows: number = 5

  filters: SortingMethod[] | undefined

  selectedfilter: SortingMethod | undefined

  sortbylist: SortingMethod[] | undefined
  selectedsortby: SortingMethod | undefined

  filteredProviders: Job[] | undefined

  constructor(
    private authService: AuthService,
    public mobile: MobileService,
    //private orderPipe: OrderPipe,
    private jobService: JobService,
    private publicJobService: PublicJobService,
    private userService: UserService,
    private router: Router //public filterPipe: FilterPipe
  ) {}

  async ngOnInit() {
    this.activejobTypes = [
      { label: 'Active Jobs', code: 'active' },
      { label: 'Public Jobs', code: 'public' },
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
      { name: 'Complete', code: 'Complete' },
    ]
    this.sortbylist = [
      { name: 'Date Posted', code: 'actionLog[0].timestamp' },
      { name: 'Project Name', code: 'information.title' },
      { name: 'Budget', code: 'budget' },
    ]

    this.selectedjob = this.activejobTypes[0]
    this.selectedfilter = this.filters[0]
    this.selectedsortby = this.sortbylist[0]

    this.currentUser = await this.authService.getCurrentUser()
    this.userType = this.currentUser.type
    this.initialiseJobs(this.currentUser.address, this.userType)
    this.orderType = 'actionLog[0].timestamp'
    this.reverseOrder = true
    this.isOnMobile = this.mobile.isOnMobile
  }

  ngOnDestroy() {
    if (this.jobsSubscription) {
      this.jobsSubscription.unsubscribe()
    }
  }

  private initialiseJobs(userId: string, userType: UserType) {
    this.jobsSubscription = this.jobService
      .getJobsByUser(userId, userType)
      .subscribe(async (jobs: Job[]) => {
        this.activeJobs = jobs
        this.loading = false
        this.jobs = this.activeJobs
        this.jobs.forEach(async (job) => {
          this.jobService.assignOtherPartyAsync(job, this.userType)
        })
        this.showFilteredJobs(this.jobs)
      })
    this.publicJobsSubscription = this.publicJobService
      .getPublicJobsByUser(userId)
      .subscribe(async (jobs: Job[]) => {
        // only show open jobs

        const open = jobs.filter(
          (job) => job.state === JobState.acceptingOffers
        )
        const draft = jobs.filter((job) => job.draft === true && job.state !== "Public job closed")
        
        this.publicJobs = open
        this.draftJobs = draft
      })
  }

  changeJob(jobType) {
    this.jobType = jobType
    switch (jobType) {
      case 'public':
        this.jobs = this.publicJobs.filter((job) => job.draft === false)
        break
      case 'active':
        this.jobs = this.activeJobs
        break
      case 'draft':
        this.jobs = this.draftJobs
    }
    this.showFilteredJobs(this.jobs)
  }

  CancelJob(id: string) {
    this.jobs = this.jobs.filter((job) => job.id !== id);
    this.showFilteredJobs(this.jobs)
  }

  showFilteredJobs(jobs: Job[]): void {
    this.totalRecords = jobs.length

    // 5 item each page
    this.filteredProviders = jobs.slice(
      this.currentPage * 5,
      this.currentPage * 5 + 5
    )
  }

  changeUserType() {
    this.userType =
      this.userType === UserType.client ? UserType.provider : UserType.client
    this.loading = true
    this.initialiseJobs(this.currentUser.address, this.userType)
  }

  viewJobDetails(jobId: string): void {
    this.router.navigate(['/inbox/job', jobId])
  }

  filterJobsByState(state: string) {
    if (this.selectedfilter.code !== '') {
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
}
