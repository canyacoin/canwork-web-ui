import { Component, NgModule, OnDestroy, OnInit, Pipe, PipeTransform, HostBinding } from '@angular/core';
import { Router } from '@angular/router';
import { FilterPipe } from 'ngx-filter-pipe';
import { OrderPipe } from 'ngx-order-pipe';
import { Observable, Subscription } from 'rxjs';

import { Job, JobDescription, PaymentType, TimeRange, WorkType } from '../../../core-classes/job';
import { User, UserType } from '../../../core-classes/user';
import { AuthService } from '../../../core-services/auth.service';
import { JobService } from '../../../core-services/job.service';
import { PublicJobService } from '../../../core-services/public-job.service';
import { MobileService } from '../../../core-services/mobile.service';
import { UserService } from '../../../core-services/user.service';

@Component({
  selector: 'app-job-dashboard',
  templateUrl: './job-dashboard.component.html',
  styleUrls: ['./job-dashboard.component.css']
})

export class JobDashboardComponent implements OnInit, OnDestroy {

  currentUser: User;
  userType: UserType;
  paymentType = PaymentType;
  jobs: Job[];
  publicJobs: Job[];
  activeJobs: Job[];
  jobsSubscription: Subscription;
  publicJobsSubscription: Subscription;
  authSub: Subscription;
  orderType: string;
  reverseOrder: boolean;
  loading = true;
  jobType = 'active';
  filterByState: any = { state: '' };
  allJobs: Job[];
  searchQuery: string;
  isOnMobile = false;

  constructor(
    private authService: AuthService,
    public mobile: MobileService,
    private orderPipe: OrderPipe,
    private jobService: JobService,
    private publicJobService: PublicJobService,
    private userService: UserService,
    private router: Router,
    public filterPipe: FilterPipe
  ) { }

  async ngOnInit() {
    this.currentUser = await this.authService.getCurrentUser();
    this.userType = this.currentUser.type;
    this.initialiseJobs(this.currentUser.address, this.userType);
    this.orderType = 'information.title';
    this.reverseOrder = false;
    this.isOnMobile = this.mobile.isOnMobile;
  }

  ngOnDestroy() {
    if (this.jobsSubscription) { this.jobsSubscription.unsubscribe(); }
  }

  private initialiseJobs(userId: string, userType: UserType) {
    this.jobsSubscription = this.jobService.getJobsByUser(userId, userType).subscribe(async (jobs: Job[]) => {
      this.activeJobs = jobs;
      this.loading = false;
      this.jobs = this.activeJobs;
      this.jobs.forEach(async (job) => {
        this.jobService.assignOtherPartyAsync(job, this.userType);
      });
    });
    this.publicJobsSubscription = this.publicJobService.getPublicJobsByUser(userId).subscribe(async (jobs: Job[]) => {
      this.publicJobs = jobs;
    });
  }

  changeJob(jobType) {
    this.jobType = jobType;
    switch (jobType) {
      case 'public':
        this.jobs = this.publicJobs.filter(job => job.draft === false);
        break;
      case 'active':
        this.jobs = this.activeJobs;
        break;
      case 'draft':
        this.jobs = this.publicJobs.filter(job => job.draft === true);
    }
  }

  changeUserType() {
    this.userType = this.userType === UserType.client ? UserType.provider : UserType.client;
    this.loading = true;
    this.initialiseJobs(this.currentUser.address, this.userType);
  }

  viewJobDetails(jobId: string): void {
    this.router.navigate(['/inbox/job', jobId]);
  }

  filterJobsByState() {
    console.log(this.filterByState.state !== '');
    if (this.filterByState.state !== '') {
      this.jobs = this.activeJobs.filter(job => job.state === this.filterByState.state);
    } else {
      this.jobs = this.activeJobs;
    }
  }

}


