import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable ,  Subscription } from 'rxjs';

import { Job } from '../../../../core-classes/job';
import { IJobAction } from '../../../../core-classes/job-action';
import { User, UserType } from '../../../../core-classes/user';
import { AuthService } from '../../../../core-services/auth.service';
import { JobService } from '../../../../core-services/job.service';
import { UserService } from '../../../../core-services/user.service';

@Component({
  selector: 'app-action-history',
  templateUrl: './action-history.component.html',
  styleUrls: ['./action-history.component.css']
})
export class ActionHistoryComponent implements OnInit, OnDestroy {

  currentUserType: UserType;
  actionLog: Array<IJobAction> = [];

  jobSub: Subscription;

  constructor(private authService: AuthService, private jobService: JobService, private userService: UserService, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.authService.currentUser$.take(1).subscribe((user: User) => {
      const jobId = this.activatedRoute.parent.snapshot.params['id'] || null;
      if (jobId) {
        this.jobSub = this.jobService.getJob(jobId).subscribe((job: Job) => {
          this.currentUserType = user.address === job.clientId ? UserType.client : UserType.provider;
          this.actionLog = job.actionLog;
        });
      }
    });
  }

  canViewAction(action: IJobAction): boolean {
    return action.private ? true : action.executedBy === this.currentUserType;
  }

  ngOnDestroy() {
    if (this.jobSub) { this.jobSub.unsubscribe(); }
  }
}
