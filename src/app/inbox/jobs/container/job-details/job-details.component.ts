import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Job, JobState } from '@class/job';
import { ActionType, IJobAction } from '@class/job-action';
import { User, UserType } from '@class/user';
import { AuthService } from '@service/auth.service';
import { JobService } from '@service/job.service';
import { MobileService } from '@service/mobile.service';
import { Transaction, TransactionService } from '@service/transaction.service';
import { UserService } from '@service/user.service';
import { AngularFireStorage } from 'angularfire2/storage';
import { DialogService } from 'ng2-bootstrap-modal';
import { Subscription } from 'rxjs/Subscription';

import { environment } from '../../../../../environments/environment';
import {
  ActionDialogComponent, ActionDialogOptions
} from '../action-dialog/action-dialog.component';

@Component({
  selector: 'app-job-details',
  templateUrl: './job-details.component.html',
  styleUrls: ['./job-details.component.css']
})
export class JobDetailsComponent implements OnInit, OnDestroy {

  jobState = JobState;

  currentUser: User;
  // The current user is 'acting' as this type
  // This allows providers to work as both client and provider
  currentUserType: UserType;
  job: Job;
  transactions: Transaction[] = [];
  isOnMobile = false;
  jobSub: Subscription;
  transactionsSub: Subscription;
  hideDescription = true;

  constructor(private authService: AuthService,
    private jobService: JobService,
    private userService: UserService,
    private transactionService: TransactionService,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private storage: AngularFireStorage,
    private mobile: MobileService
  ) { }

  ngOnInit() {
    this.authService.currentUser$.take(1).subscribe((user: User) => {
      this.currentUser = user;
      this.initialiseJob();
    });
    this.isOnMobile = this.mobile.isOnMobile;
  }

  ngOnDestroy() {
    if (this.jobSub) { this.jobSub.unsubscribe(); }
    if (this.transactionsSub) { this.transactionsSub.unsubscribe(); }
  }

  initialiseJob() {
    const jobId = this.activatedRoute.snapshot.params['id'] || null;
    if (jobId) {
      this.jobSub = this.jobService.getJob(jobId).subscribe((job: Job) => {
        this.job = new Job(job);
        this.currentUserType = this.currentUser.address === job.clientId ? UserType.client : UserType.provider;
        this.jobService.assignOtherPartyAsync(this.job, this.currentUserType);
        this.setAttachmentUrl(this.job.information.attachments);
      });

      this.transactionsSub = this.transactionService.getTransactionsByJob(jobId).subscribe((transactions: Transaction[]) => {
        this.transactions = transactions;
      })
    }
  }

  actionIsDisabled(action: ActionType): boolean {
    return action === ActionType.dispute || this.hasPendingTransactions;
  }

  get hasPendingTransactions(): boolean {
    if (this.transactions) {
      return this.transactions.findIndex(x => !x.failure && !x.success) > -1;
    }
    return false;
  }

  get availableActions(): ActionType[] {
    return this.jobService.getAvailableActions(this.job.state, this.currentUserIsClient);
  }

  get currentUserIsClient() {
    return this.currentUserType === UserType.client;
  }

  private setAttachmentUrl(attachments) {
    const attachment = this.job.information.attachments;
    if (attachment.length > 0) { // check if there's any attachment on this job
      if (attachment[0].url == null) { // [0] is used here since we only support single file upload anyway.
        console.log('An attachment without URL ! getting the url...');
        if (attachment[0].filePath != null) { // Assume that it's caused by the async issue
          let urlSub: Subscription;
          urlSub = this.storage.ref(attachment[0].filePath).getDownloadURL().subscribe(downloadUrl => {
            attachment[0].url = downloadUrl; // change this attachment's (null) url into the actual url.
            console.log('attachment URL is now ' + attachment[0].url);
          });
          urlSub.unsubscribe(); // unsubscibe to the UrlSub just in case
        }
      }
    }
  }

  /* For the explanation modal */
  get stateExplanation(): string {
    switch (this.job.state) {
      case JobState.offer:
        return 'A client has offered a job to a provider and is awaiting the provider\'s acceptance';
      case JobState.workPendingCompletion:
        return 'The provider has marked the job as complete and is awaiting the client\'s acceptance';
      case JobState.cancelled:
        return this.currentUserType === UserType.client ? 'You cancelled this job.' : 'This job has been cancelled by the client';
      case JobState.declined:
        return 'This job offer was turned down by the provider';
      case JobState.inDispute:
        return 'The provider or the client has raised a dispute. This is being resolved by the CanYa DAO';
      case JobState.providerCounterOffer:
        return 'The provider has countered the client\'s offer';
      case JobState.clientCounterOffer:
        return 'The client has countered the provider\'s offer';
      case JobState.termsAcceptedAwaitingEscrow:
        return this.currentUserType === UserType.client ?
          'The job\'s terms has been accepted. You can now send the agreed amount of money to the escrow to commence the job.'
          : 'You have agreed to the terms and conditions of this job, you will need to wait for the client to send the funds to escrow.';
      case JobState.complete:
        return 'This job has been marked as complete by the client.';
      case JobState.authorisedEscrow:
        return 'The escrow has been authorised by the client, they can now send the funds to escrow.';
      case JobState.inEscrow:
        return 'The funds has been deposited in the escrow! you can now commence the job.';
      case JobState.reviewed:
        return 'Both parties have completed the job, and a review has been left for the provider!';
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
      case JobState.reviewed:
        return 'Reviewed';
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

  getTxLink(txHash: string) {
    return `http://${environment.contracts.useTestNet ? 'ropsten.' : ''}etherscan.io/tx/${txHash}`;
  }

  getTxColor(tx: Transaction) {
    return tx.success ? 'success' : tx.failure ? 'danger' : 'warning';
  }

  toggleDescription() {
    this.hideDescription = !this.hideDescription;
    console.log(this.hideDescription);
  }

}
