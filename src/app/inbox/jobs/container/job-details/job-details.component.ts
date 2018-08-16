import { Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Job, JobDescription, JobState, PaymentType, TimeRange, WorkType } from '@class/job';
import { ActionType, IJobAction } from '@class/job-action';
import { User, UserType } from '@class/user';
import { AuthService } from '@service/auth.service';
import { JobService } from '@service/job.service';
import { UserService } from '@service/user.service';
import { AngularFireStorage } from 'angularfire2/storage';
import { DialogService } from 'ng2-bootstrap-modal';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

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
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private storage: AngularFireStorage
  ) { }

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
        const attachment = this.job.information.attachments;
        // check if there's any attachment on this job
        if (attachment.length > 0) {
          // [0] is used here since we only support single file upload anyway.
          if (attachment[0].url == null) {
            console.log('An attachment without URL ! getting the url...');
            // If there's an attachment but not the URL we can safely assume that it's caused by the async issue
            if (attachment[0].filePath != null) {
              let urlSub: Subscription;
              // If this attachment has a filepath, then convert it into a usable URL by using the code below.
              urlSub = this.storage.ref(attachment[0].filePath).getDownloadURL().subscribe(downloadUrl => {
                attachment[0].url = downloadUrl; // change this attachment's (null) url into the actual url.
                console.log('attachment URL is now ' + attachment[0].url);
              });
              urlSub.unsubscribe(); // unsubscibe to the UrlSub just in case
            }
          }
        }
      });
    }
  }

  actionIsDisabled(action: ActionType): boolean {
    return action === ActionType.addMessage || action === ActionType.dispute;
  }

  get availableActions(): ActionType[] {
    return this.jobService.getAvailableActions(this.job.state, this.currentUserIsClient);
  }

  get currentUserIsClient() {
    return this.currentUserType === UserType.client;
  }

  /* For the explanation modal */
  get stateExplanation(): string {
    switch (this.job.state) {
      case JobState.offer:
        return "A client has offered a job to a provider and is awaiting the provider's acceptance";
      case JobState.workPendingCompletion:
        return "The provider has marked the job as complete and is awaiting the client's acceptance";
      case JobState.cancelled:
        return "This job has been cancelled by the client";
      case JobState.declined:
        return "This job offer was turned down by the provider";
      case JobState.inDispute:
        return "The provider or the client has raised a dispute. This is being resolved by the CanYa DAO";
      case JobState.providerCounterOffer:
        return "The provider has countered the client's offer";
      case JobState.clientCounterOffer:
        return "The client has countered the provider's offer";
      case JobState.termsAcceptedAwaitingEscrow:
        return "The job's terms has been accepted. The client should now send the agreed amount of money to the escrow to commence the job.";
      case JobState.complete:
        return 'This job has been marked as complete by the client.';
      case JobState.authorisedEscrow:
        return 'The escrow has been authorised by the client, they can now send the funds to escrow.';
      default:
        return '';
    }
  }
  /* Customizeable messages for each job status. */
  get stateStatus(): string {
    switch (this.job.state) {
      case JobState.offer:
        return 'Job offered';
      case JobState.workPendingCompletion:
        return 'Pending completion';
      case JobState.cancelled:
        return 'Cancelled by client';
      case JobState.declined:
        return 'Declined by provider';
      case JobState.inDispute:
        return 'Dispute raised';
      case JobState.providerCounterOffer:
        return 'Offer countered by provider';
      case JobState.clientCounterOffer:
        return 'Offer countered by client';
      case JobState.termsAcceptedAwaitingEscrow:
        return this.currentUserType === UserType.client ? 'Awaiting escrow authorisation' : 'Awaiting payment to escrow';
      case JobState.authorisedEscrow:
        return this.currentUserType === UserType.client ? 'Awaiting escrow deposit' : 'Awaiting payment to escrow';
      case JobState.inEscrow:
        return 'Funds in escrow';
      case JobState.complete:
        return 'Completed';
      default:
        return '';
    }
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
      } else {
        console.log('Action cancelled');
      }
    });
  }

  getActionExecutor(action: IJobAction) {
    return action.executedBy === this.currentUserType ? 'You' : this.job['otherParty'] ? this.job['otherParty'].name : '';
  }

}
