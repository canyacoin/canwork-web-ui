import { NgSwitch } from '@angular/common';
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';

import { Job, JobState, Payment, PaymentType, TimeRange, WorkType } from '@class/job';
import { CanWorkJobContract } from '@contract/can-work-job.contract';

import {
    ActionType,
    CounterOfferAction,
    EnterEscrowAction,
    IJobAction
} from '@class/job-action';

import { Upload } from '@class/upload';
import { User, UserType } from '@class/user';
import { ChatService } from '@service/chat.service';

import { UserService } from '@service/user.service';

import { EthService, CanPayService, Operation, View } from '@canyaio/canpay-lib';

@Injectable()
export class JobService {

  jobsCollection: AngularFirestoreCollection<any>;

  constructor(
    private afs: AngularFirestore,
    private userService: UserService,
    private chatService: ChatService,
    private ethService: EthService,
    private canPayService: CanPayService) {

    this.jobsCollection = this.afs.collection<any>('jobs');
  }

  // =========================
  //      BASIC GETS
  // =========================

  /** Get a job from firebase */
  getJob(jobId: string): Observable<Job> {
    return this.afs.doc(`jobs/${jobId}`).snapshotChanges().map(doc => {
      const job = doc.payload.data() as Job;
      job.id = jobId;
      return job;
    });
  }

  /** Get all of a users jobs, based on their type */
  getJobsByUser(userId: string, userType: UserType): Observable<Job[]> {
    const propertyToCheck = userType === UserType.client ? 'clientId' : 'providerId';
    return this.afs.collection<any>('jobs', ref => ref.where(propertyToCheck, '==', userId)).snapshotChanges().map(changes => {
      return changes.map(a => {
        const data = a.payload.doc.data() as Job;
        data.id = a.payload.doc.id;
        return data;
      });
    });
  }

  /** Add the 'other party' details to a job, i.e. the clients picture and name */
  async assignOtherPartyAsync(job: Job, viewingUserType: UserType) {
    if (job.clientId && job.providerId) {
      job['otherParty'] = await this.userService.getUser(viewingUserType === UserType.client ? job.providerId : job.clientId);
    }
  }

  // =========================
  //      JOB ACTIONS
  // =========================

  /**
   * Handles all actions taken on a job, performing the action and afterwards updating the job state and sending chat messages.
   * Locally copies the job first so that it doesn't update the view before the action has been registered on firebase
   */
  async handleJobAction(job: Job, action: IJobAction): Promise<boolean> {
    const parsedJob = new Job(await this.parseJobToObject(job));
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        switch (action.type) {
          case ActionType.createJob:
            parsedJob.actionLog.push(action);
            parsedJob.state = JobState.offer;
            await this.saveJobFirebase(parsedJob);
            // note - chat service is handled in post.component for this action ONLY
            resolve(true);
            break;
          case ActionType.cancelJob:
            parsedJob.actionLog.push(action);
            parsedJob.state = JobState.cancelled;
            await this.saveJobFirebase(parsedJob);
            await this.chatService.sendJobMessages(parsedJob, action);
            // todo: send email
            resolve(true);
            break;
          case ActionType.counterOffer:
            parsedJob.actionLog.push(action);
            parsedJob.state = action.executedBy === UserType.client ? JobState.clientCounterOffer : JobState.providerCounterOffer;
            parsedJob.budget = (action as CounterOfferAction).amount;
            await this.saveJobFirebase(parsedJob);
            await this.chatService.sendJobMessages(parsedJob, action);
            // todo: send email
            resolve(true);
            break;
          case ActionType.acceptTerms:
            parsedJob.actionLog.push(action);
            parsedJob.state = JobState.termsAcceptedAwaitingEscrow;
            await this.saveJobFirebase(parsedJob);
            await this.chatService.sendJobMessages(parsedJob, action);
            // todo: send email
            resolve(true);
            break;
          case ActionType.declineTerms:
            parsedJob.actionLog.push(action);
            parsedJob.state = JobState.declined;
            await this.saveJobFirebase(parsedJob);
            await this.chatService.sendJobMessages(parsedJob, action);
            // todo: send email
            resolve(true);
            break;
          case ActionType.enterEscrow:

            let canWorkContract = new CanWorkJobContract(this.ethService)
            canWorkContract.connect()
            canWorkContract.setAddress(CanWorkJobContract.ADDRESS_PRIVATE)

            let onComplete = async () => {
              const escrowAction = action as EnterEscrowAction;
              parsedJob.canInEscrow = escrowAction.amountCan || 0;
              parsedJob.paymentLog.push(new Payment({
                txId: escrowAction.txId || '',
                timestamp: escrowAction.timestamp || '',
                amountCan: escrowAction.amountCan || 0
              }));
              parsedJob.actionLog.push(escrowAction);
              parsedJob.state = JobState.inEscrow;

              await this.saveJobFirebase(parsedJob);
              await this.chatService.sendJobMessages(parsedJob, escrowAction);

              await canWorkContract.createJob(job, job.clientId, job.providerId, escrowAction.amountCan)

              // todo: send email

              this.canPayService.close()
            }

            let onCancel = () => {
              this.canPayService.close()
            }

            let canPayOptions = {
              dAppName: `CanWorkJob Escrow contract ${CanWorkJobContract.ADDRESS_PRIVATE}`,
              recepient: CanWorkJobContract.ADDRESS_PRIVATE,
              operation: Operation.auth,
              amount: 0, // allow the user to enter amount through an input box
              complete: onComplete,
              cancel: onCancel,
              view: View.Compact
            }

            this.canPayService.open(canPayOptions)

            resolve(true);
            break;
          case ActionType.addMessage:
            parsedJob.actionLog.push(action);
            await this.saveJobFirebase(parsedJob);
            await this.chatService.sendJobMessages(parsedJob, action);
            resolve(true);
            break;
          case ActionType.finishedJob:
            parsedJob.actionLog.push(action);
            parsedJob.state = JobState.workPendingCompletion;
            await this.saveJobFirebase(parsedJob);
            await this.chatService.sendJobMessages(parsedJob, action);
            // todo: send email
            resolve(true);
            break;
          case ActionType.acceptFinish:
            // TODO: put canPAY in here and listen for the receipt
            // release the funds! When they are successfully released... then complete

            parsedJob.actionLog.push(action);
            parsedJob.state = JobState.complete;
            parsedJob.paymentLog.push(new Payment({
              txId: '',
              timestamp: '',
              amountCan: null // add a 'release funds' property?
            }));
            await this.saveJobFirebase(parsedJob);
            await this.chatService.sendJobMessages(parsedJob, action);
            // todo: send email

            resolve(true);
            break;
          case ActionType.dispute:
            // TODO: May need to think more about this
            parsedJob.actionLog.push(action);
            parsedJob.state = JobState.inDispute;
            await this.saveJobFirebase(parsedJob);
            await this.chatService.sendJobMessages(parsedJob, action);
            // todo: send email
            resolve(true);
            break;
          default:
            resolve(true);
        }
      } catch (e) {
        reject(false);
      }
    });
  }

  private async saveJobFirebase(job: Job): Promise<any> {
    const x = await this.parseJobToObject(job);
    return this.jobsCollection.doc(job.id).set(x);
  }

  async createJobChat(job: Job, action: IJobAction, client: User, provider: User) {
    const channelId = await this.chatService.createChannelsAsync(client, provider);
    if (channelId) {
      this.chatService.sendJobMessages(job, action);
    }
  }

  // =========================
  //      JOB HELPERS
  // =========================

  /** Helper method to get the actions that are able to be performed on a job, based on its state and the user type */
  getAvailableActions(jobState: JobState, forClient: boolean): ActionType[] {
    switch (jobState) {
      case JobState.offer:
        return forClient ? [ActionType.cancelJob] : [ActionType.acceptTerms, ActionType.counterOffer, ActionType.declineTerms];
      case JobState.providerCounterOffer:
        return forClient ? [ActionType.acceptTerms, ActionType.counterOffer, ActionType.declineTerms] : [ActionType.cancelJob];
      case JobState.clientCounterOffer:
        return forClient ? [ActionType.cancelJob] : [ActionType.acceptTerms, ActionType.counterOffer, ActionType.declineTerms];
      case JobState.termsAcceptedAwaitingEscrow:
        return forClient ? [ActionType.enterEscrow, ActionType.cancelJob] : [ActionType.cancelJob];
      case JobState.inEscrow:
        return forClient ? [ActionType.dispute, ActionType.addMessage] : [ActionType.finishedJob, ActionType.addMessage];
      case JobState.workPendingCompletion:
        return forClient ? [ActionType.acceptFinish, ActionType.dispute, ActionType.addMessage] : [ActionType.dispute, ActionType.addMessage];
      case JobState.inDispute:
        return forClient ? [ActionType.acceptFinish, ActionType.addMessage] : [ActionType.addMessage];
      case JobState.cancelled || JobState.declined || JobState.complete:
        return [];
      default:
        return [];
    }
  }

  /** Helper method to get the colour associated with each action button */
  getActionColour(action: ActionType): string {
    switch (action) {
      case ActionType.cancelJob:
      case ActionType.dispute:
        return 'danger';
      case ActionType.declineTerms:
        return 'danger';
      case ActionType.counterOffer:
      case ActionType.addMessage:
        return 'info';
      case ActionType.acceptTerms:
      case ActionType.enterEscrow:
      case ActionType.finishedJob:
      case ActionType.acceptFinish:
        return 'success';
      default:
        return 'info';
    }
  }

  /** Job object must be re-assigned as firebase doesn't accept strong types */
  private parseJobToObject(job: Job): Promise<object> {
    const parsedAttachments: Array<any> = [];
    job.information.attachments.forEach((attachment: Upload) => {
      parsedAttachments.push(this.parseUpload(attachment));
    });
    const parsedInfo = Object.assign({}, job.information);
    parsedInfo.attachments = parsedAttachments;

    const parsedPayments: Array<any> = [];
    job.paymentLog.forEach((payment: Payment) => {
      parsedAttachments.push(Object.assign({}, payment));
    });

    const parsedActions: Array<any> = [];
    job.actionLog.forEach((action: IJobAction) => {
      parsedActions.push(Object.assign({}, action));
    });

    const parsedJob = Object.assign({}, job);
    parsedJob.information = parsedInfo;
    parsedJob.paymentLog = parsedPayments;
    parsedJob.actionLog = parsedActions;
    return Promise.resolve(parsedJob);
  }

  private parseUpload(upload: Upload): any {
    const parsedUpload: any = Object.assign({}, upload);
    return parsedUpload;
  }
}
