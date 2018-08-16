import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { OrderPipe } from 'ngx-order-pipe';
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

  constructor(private authService: AuthService, private orderPipe: OrderPipe, private jobService: JobService, private userService: UserService, private router: Router) { }

  ngOnInit() {
    this.authSub = this.authService.currentUser$.subscribe((user: User) => {
      if (!this.currentUser && user) {
        this.userType = user.type;
        this.initialiseJobs(user.address, this.userType);
        this.loading = false;
      }
      this.currentUser = user;
    });
    this.orderType = 'name';
    this.reverseOrder = false;
  }

  ngOnDestroy() {
    if (this.jobsSubscription) { this.jobsSubscription.unsubscribe(); }
    if (this.authSub) { this.authSub.unsubscribe(); }
  }

  private initialiseJobs(userId: string, userType: UserType) {
    this.jobsSubscription = this.jobService.getJobsByUser(userId, userType).subscribe(async (jobs: Job[]) => {
      this.jobs = jobs;
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
  setNewOrderType(selection: any) {
    switch (selection) {
      case (selection === '1'):
        this.orderType = 'name';
        break;
      case (selection === '2'):
        this.orderType = 'budget';
        this.reverseOrder = false;
        break;
      case (selection === '3'):
        console.log('changing...');
        this.orderType = 'budget';
        this.reverseOrder = true;
        break;
      case (selection === '4'):
        this.orderType = 'actionLog[0].timestamp';
        this.reverseOrder = false;
        break;
      case (selection === '5'):
        this.orderType = 'actionLog[0].timestamp';
        this.reverseOrder = true;
        break;
    }
    console.log(selection === '2');
    console.log(typeof(selection));
    console.log('SortBy : ' + this.orderType + ':' + this.reverseOrder);
  }
}
