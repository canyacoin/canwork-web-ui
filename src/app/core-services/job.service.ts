import { NgSwitch } from '@angular/common';
import { Injectable } from '@angular/core';
import {
    CanPayData, CanPayService, EthService, Operation, setProcessResult, View
} from '@canyaio/canpay-lib';
import { Job, JobState, Payment, PaymentType, TimeRange, WorkType } from '@class/job';
import { ActionType, IJobAction } from '@class/job-action';
import { Upload } from '@class/upload';
import { User, UserType } from '@class/user';
import { CanWorkJobContract } from '@contract/can-work-job.contract';
import { environment } from '@env/environment';
import { ChatService } from '@service/chat.service';
import { CanWorkEthService } from '@service/eth.service';
import { JobNotificationService } from '@service/job-notification.service';
import { MomentService } from '@service/moment.service';
import { Transaction, TransactionService } from '@service/transaction.service';
import { UserService } from '@service/user.service';
import { GenerateGuid } from '@util/generate.uid';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { FeatureToggleService } from './feature-toggle.service';

@Injectable()
export class JobService {

  jobsCollection: AngularFirestoreCollection<any>;
  canexDisabled = false;

  constructor(
    private afs: AngularFirestore,
    private userService: UserService,
    private chatService: ChatService,
    private momentService: MomentService,
    private transactionService: TransactionService,
    private canWorkEthService: CanWorkEthService,
    private ethService: EthService,
    private jobNotificationService: JobNotificationService,
    private canPayService: CanPayService,
    private featureService: FeatureToggleService) {

    this.jobsCollection = this.afs.collection<any>('jobs');
    this.featureService.getFeatureConfig('canexchange').then(val => {
      this.canexDisabled = !val.enabled;
    }).catch(e => {
      this.canexDisabled = true;
    });
  }

  // =========================
  //      BASIC GETS
  // =========================

  /** Get a job from firebase */
  getJob(jobId: string): Observable<Job> {
    return this.afs.doc(`jobs/${jobId}`).snapshotChanges().pipe(map(doc => {
      const job = doc.payload.data() as Job;
      job.id = jobId;
      return job;
    }));
  }

  /** Get all of a users jobs, based on their type */
  getJobsByUser(userId: string, userType: UserType): Observable<Job[]> {
    const propertyToCheck = userType === UserType.client ? 'clientId' : 'providerId';
    return this.afs.collection<any>('jobs', ref => ref.where(propertyToCheck, '==', userId)).snapshotChanges().pipe(map(changes => {
      return changes.map(a => {
        const data = a.payload.doc.data() as Job;
        data.id = a.payload.doc.id;
        return data;
      });
    }));
  }

  async getReviewedJobsByUser(user: User) {
    const userType = user.type === UserType.client ? 'clientId' : 'providerId';
    const data = await this.jobsCollection.ref
      .where(userType, '==', user.address)
      .where('state', '==', JobState.reviewed).get();
    return data;
  }

  async getJobBudget(job: Job): Promise<number> {
    const canToUsd = await this.canWorkEthService.getCanToUsd();
    if (canToUsd) {
      const totalBudget = await this.getJobBudgetUsd(job);
      return Promise.resolve(Math.floor(totalBudget / canToUsd));
    } else {
      return Promise.reject(false);
    }
  }

  async getJobBudgetUsd(job: Job): Promise<number> {
    return job.paymentType === PaymentType.fixed ? job.budget : job.budget * this.getTotalWorkHours(job);
  }

  private getTotalWorkHours(job: Job): number {
    const weeklyHours = job.information.weeklyCommitment;
    switch (job.information.timelineExpectation) {
      case TimeRange.oneWeek:
        return 1 * weeklyHours;
      case TimeRange.oneToTwoWeeks:
        return 2 * weeklyHours;
      case TimeRange.twoToFourWeeks:
        return 4 * weeklyHours;
      case TimeRange.oneMonth:
        return 4 * weeklyHours;
      case TimeRange.oneToTwoMonths:
        return 8 * weeklyHours;
      case TimeRange.twoToFourMonths:
        return 17 * weeklyHours;
      case TimeRange.fourToSixMonths:
        return 26 * weeklyHours;
      case TimeRange.upToYear:
        return 52 * weeklyHours;
    }
  }

  /** Add the 'other party' details to a job, i.e. the clients picture and name */
  async assignOtherPartyAsync(job: Job, viewingUserType: UserType) {
    if (job.clientId && job.providerId) {
      const otherParty = await this.userService.getUser(viewingUserType === UserType.client ? job.providerId : job.clientId);
      job['otherParty'] = { avatar: otherParty.avatar, name: otherParty.name };
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
    let client, provider: User;
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        switch (action.type) {
          case ActionType.createJob:
            parsedJob.actionLog.push(action);
            parsedJob.state = JobState.offer;
            await this.saveJobFirebase(parsedJob);
            await this.jobNotificationService.notify(action.type, job.id);
            // note - chat service is handled in post.component for this action ONLY
            resolve(true);
            break;
          case ActionType.cancelJob:
            parsedJob.actionLog.push(action);
            parsedJob.state = JobState.cancelled;
            await this.saveJobAndNotify(parsedJob, action);
            resolve(true);
            break;
          case ActionType.counterOffer:
            parsedJob.actionLog.push(action);
            parsedJob.state = action.executedBy === UserType.client ? JobState.clientCounterOffer : JobState.providerCounterOffer;
            parsedJob.budget = action.amountUsd;
            await this.saveJobAndNotify(parsedJob, action);
            resolve(true);
            break;
          case ActionType.acceptTerms:
            try {
              const totalBudgetCan = await this.getJobBudget(job);
              if (totalBudgetCan !== 0) {
                parsedJob.budgetCan = totalBudgetCan;
                parsedJob.actionLog.push(action);
                parsedJob.state = JobState.termsAcceptedAwaitingEscrow;
                await this.saveJobAndNotify(parsedJob, action);
                resolve(true);
              }
            } catch (e) {
              reject();
            }
            break;
          case ActionType.declineTerms:
            parsedJob.actionLog.push(action);
            parsedJob.state = JobState.declined;
            await this.saveJobAndNotify(parsedJob, action);
            resolve(true);
            break;
          case ActionType.addMessage:
            parsedJob.actionLog.push(action);
            await this.saveJobAndNotify(parsedJob, action);
            resolve(true);
            break;
          case ActionType.finishedJob:
            parsedJob.actionLog.push(action);
            parsedJob.state = JobState.workPendingCompletion;
            await this.saveJobAndNotify(parsedJob, action);
            resolve(true);
            break;
          case ActionType.dispute:
            parsedJob.actionLog.push(action);
            parsedJob.state = JobState.inDispute;
            await this.saveJobAndNotify(parsedJob, action);
            resolve(true);
            break;
          case ActionType.review:
            client = await this.userService.getUser(job.clientId);
            provider = await this.userService.getUser(job.providerId);
            await this.userService.newReview(client, provider, parsedJob, action);
            parsedJob.actionLog.push(action);
            await this.saveJobFirebase(parsedJob);
            resolve(true);
            break;
          case ActionType.authoriseEscrow:
          case ActionType.enterEscrow:
          case ActionType.acceptFinish:
          default:
            reject(false);
        }
      } catch (e) {
        reject(false);
      }
    });
  }

  private async saveJobAndNotify(job: Job, action: IJobAction) {
    await this.saveJobFirebase(job);
    await this.chatService.sendJobMessages(job, action);
    await this.jobNotificationService.notify(action.type, job.id);
  }

  async saveJobFirebase(job: Job): Promise<any> {
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

    const actions = {};

    actions[JobState.offer] = forClient ? [ActionType.cancelJob] : [ActionType.acceptTerms, ActionType.counterOffer, ActionType.declineTerms];
    actions[JobState.providerCounterOffer] = forClient ? [ActionType.acceptTerms, ActionType.counterOffer, ActionType.declineTerms] : [ActionType.cancelJob];
    actions[JobState.clientCounterOffer] = forClient ? [ActionType.cancelJob] : [ActionType.acceptTerms, ActionType.counterOffer, ActionType.declineTerms];
    actions[JobState.termsAcceptedAwaitingEscrow] = forClient ? [ActionType.authoriseEscrow, ActionType.cancelJob] : [ActionType.cancelJob];
    actions[JobState.authorisedEscrow] = forClient ? [ActionType.enterEscrow, ActionType.cancelJob] : [];
    actions[JobState.inEscrow] = forClient ? [ActionType.dispute, ActionType.addMessage] : [ActionType.finishedJob, ActionType.addMessage];
    actions[JobState.workPendingCompletion] = forClient ? [ActionType.acceptFinish, ActionType.dispute, ActionType.addMessage] : [ActionType.dispute, ActionType.addMessage];
    actions[JobState.inDispute] = forClient ? [ActionType.acceptFinish, ActionType.addMessage] : [ActionType.addMessage];
    actions[JobState.cancelled] = [];
    actions[JobState.declined] = [];
    actions[JobState.complete] = [ActionType.review];
    actions[JobState.reviewed] = [];

    return actions[jobState] || [];
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
      parsedPayments.push(Object.assign({}, payment));
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
