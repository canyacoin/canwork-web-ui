import { Component, NgModule, OnDestroy, OnInit, Pipe, PipeTransform } from '@angular/core';
import { Router } from '@angular/router';
import { FilterPipe } from 'ngx-filter-pipe';
import { OrderPipe } from 'ngx-order-pipe';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { Job, JobDescription, PaymentType, TimeRange, WorkType } from '../../../core-classes/job';
import { User, UserType } from '../../../core-classes/user';
import { AuthService } from '../../../core-services/auth.service';
import { JobService } from '../../../core-services/job.service';
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
  jobsSubscription: Subscription;
  authSub: Subscription;
  orderType: string;
  reverseOrder: boolean;
  loading = true;
  filterByState: any = { state: '' };
  allJobs: Job[];
  searchQuery: string;


  constructor(private authService: AuthService, private orderPipe: OrderPipe, private jobService: JobService, private userService: UserService, private router: Router, public filterPipe: FilterPipe) { }

  ngOnInit() {
    this.authSub = this.authService.currentUser$.subscribe((user: User) => {
      if (!this.currentUser && user) {
        this.userType = user.type;
        this.initialiseJobs(user.address, this.userType);
        this.loading = false;
      }
      this.currentUser = user;
    });
    this.orderType = 'information.title';
    this.reverseOrder = false;
  }

  ngOnDestroy() {
    if (this.jobsSubscription) { this.jobsSubscription.unsubscribe(); }
    if (this.authSub) { this.authSub.unsubscribe(); }
  }

  private initialiseJobs(userId: string, userType: UserType) {
    this.jobsSubscription = this.jobService.getJobsByUser(userId, userType).subscribe(async (jobs: Job[]) => {
      this.jobs = jobs;
      this.allJobs = jobs;
      this.loading = false;
      this.jobs.forEach(async (job) => {
        this.jobService.assignOtherPartyAsync(job, this.userType);
        console.log(job);
      });
    });
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
    this.jobs = this.filterPipe.transform(this.allJobs, this.filterByState);
  }

}


