import { Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from 'ng2-bootstrap-modal';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import {
    Job, JobDescription, JobState, PaymentType, TimeRange, WorkType
} from '../../../../core-classes/job';
import { ActionType, IJobAction } from '../../../../core-classes/job-action';
import { User, UserType } from '../../../../core-classes/user';
import { AuthService } from '../../../../core-services/auth.service';
import { JobNotificationService } from '../../../../core-services/job-notification.service';
import { JobService } from '../../../../core-services/job.service';
import { UserService } from '../../../../core-services/user.service';
import {
    ActionDialogComponent, ActionDialogOptions
} from '../action-dialog/action-dialog.component';

@Component({
  selector: 'app-job-details',
  templateUrl: './job-details.component.html',
  styleUrls: ['./job-details.component.css']
})
export class JobDetailsComponent implements OnInit, OnDestroy {

  currentUser: User;

  currentUserType: UserType;
  job: Job;
  jobState = JobState;

  jobSub: Subscription;

  constructor(private authService: AuthService,
    private jobService: JobService,
    private jobNotificationService: JobNotificationService,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService) { }

  ngOnInit() {
    this.authService.currentUser$.take(1).subscribe((user: User) => {
      this.currentUser = user;
      this.initialiseJob();
    });
  }

  ngOnDestroy() {
    if (this.jobSub) { this.jobSub.unsubscribe(); }
  }

  initialiseJob() {
    const jobId = this.activatedRoute.snapshot.params['id'] || null;
    if (jobId) {
      this.jobSub = this.jobService.getJob(jobId).subscribe((job: Job) => {
        this.job = job;
        this.currentUserType = this.currentUser.address === job.clientId ? UserType.client : UserType.provider;
        this.jobService.assignOtherPartyAsync(this.job, this.currentUserType);
      });
    }
  }

  get availableActions(): ActionType[] {
    return this.jobService.getAvailableActions(this.job.state, this.currentUserIsClient);
  }

  get currentUserIsClient() {
    return this.currentUserType === UserType.client;
  }

  getActionColour(action: ActionType): string {
    return this.jobService.getActionColour(action);
  }

  executeAction(action: ActionType) {
    const disposable = this.dialogService.addDialog(ActionDialogComponent, new ActionDialogOptions({
      job: this.job,
      userType: this.currentUserType,
      actionType: action
    })).subscribe((success) => {
      if (success) {
        console.log('Action executed');
        this.jobNotificationService.notify(action, this.job.id);
      } else {
        console.log('Action cancelled');
      }
    });
  }

  getActionExecutor(action: IJobAction) {
    return action.executedBy === this.currentUserType ? 'You' : this.job['otherParty'] ? this.job['otherParty'].name : '';
  }

}
