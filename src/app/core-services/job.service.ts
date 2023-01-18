import { Injectable } from '@angular/core'
import { Job, JobState, Payment, PaymentType, TimeRange } from '@class/job'
import { ActionType, IJobAction } from '@class/job-action'
import { Upload } from '@class/upload'
import { User, UserType } from '@class/user'
import { ChatService } from '@service/chat.service'
import { BscService } from '@service/bsc.service'
import { TransactionService } from '@service/transaction.service'
import { Router } from '@angular/router'
import { ToastrService } from 'ngx-toastr'

import { JobNotificationService } from '@service/job-notification.service'
import { UserService } from '@service/user.service'
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from 'angularfire2/firestore'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { ReviewService } from './review.service'

@Injectable()
export class JobService {
  jobsCollection: AngularFirestoreCollection<any>

  constructor(
    private afs: AngularFirestore,
    private userService: UserService,
    private chatService: ChatService,
    private reviewService: ReviewService,
    private bscService: BscService,
    private transactionService: TransactionService,
    private jobNotificationService: JobNotificationService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.jobsCollection = this.afs.collection<any>('jobs')
  }

  // =========================
  //      BASIC GETS
  // =========================

  /** Get a job from firebase */
  getJob(jobId: string): Observable<Job> {
    return this.afs
      .doc(`jobs/${jobId}`)
      .snapshotChanges()
      .pipe(
        map(doc => {
          const job = doc.payload.data() as Job
          job.id = jobId
          return job
        })
      )
  }

  /** Get all of a users jobs, based on their type */
  getJobsByUser(userId: string, userType: UserType): Observable<Job[]> {
    const propertyToCheck =
      userType === UserType.client ? 'clientId' : 'providerId'
    return this.afs
      .collection<any>('jobs', ref => ref.where(propertyToCheck, '==', userId))
      .snapshotChanges()
      .pipe(
        map(changes => {
          return changes.map(a => {
            const data = a.payload.doc.data() as Job
            data.id = a.payload.doc.id
            return data
          })
        })
      )
  }

  async getReviewedJobsByUser(user: User) {
    const userType = user.type === UserType.client ? 'clientId' : 'providerId'
    const data = await this.jobsCollection.ref
      .where(userType, '==', user.address)
      .where('state', '==', JobState.reviewed)
      .get()
    return data
  }

  async getJobBudgetUsd(job: Job): Promise<number> {
    return job.paymentType === PaymentType.fixed
      ? job.budget
      : job.budget * this.getTotalWorkHours(job)
  }

  private getTotalWorkHours(job: Job): number {
    const weeklyHours = job.information.weeklyCommitment
    switch (job.information.timelineExpectation) {
      case TimeRange.oneWeek:
        return 1 * weeklyHours
      case TimeRange.oneToTwoWeeks:
        return 2 * weeklyHours
      case TimeRange.twoToFourWeeks:
        return 4 * weeklyHours
      case TimeRange.oneMonth:
        return 4 * weeklyHours
      case TimeRange.oneToTwoMonths:
        return 8 * weeklyHours
      case TimeRange.twoToFourMonths:
        return 17 * weeklyHours
      case TimeRange.fourToSixMonths:
        return 26 * weeklyHours
      case TimeRange.upToYear:
        return 52 * weeklyHours
    }
  }

  /** Add the 'other party' details to a job, i.e. the clients picture and name */
  async assignOtherPartyAsync(job: Job, viewingUserType: UserType) {
    if (job.clientId && job.providerId) {
      const otherParty = await this.userService.getUser(
        viewingUserType === UserType.client ? job.providerId : job.clientId
      )
      if (otherParty) {
        job['otherParty'] = {
          avatar: otherParty.avatar,
          name: otherParty.name,
          id: otherParty.address,
          verified: otherParty.verified,
        }
      }
    }
  }

  async updateJobState(job: Job) {
    // const pendingCompletion =
    //   job.state === JobState.workPendingCompletion ||
    //   job.state === JobState.inDispute
    // if (
    //   job.state === JobState.termsAcceptedAwaitingEscrow ||
    //   job.state === JobState.authorisedEscrow ||
    //   job.state === JobState.inEscrow ||
    //   pendingCompletion
    // ) {
    //   let url = `${environment.transactionMonitor.callbackUri}/check-job-state`
    //   url += `?jobID=${job.id}&jobHexID=${job.hexId}&skipNew=${pendingCompletion}`
    //   try {
    //     await this.http.get(url).toPromise()
    //   } catch (error) {
    //     console.error(`! http get error checking job state`, error)
    //   }
    // }
  }

  // =========================
  //      JOB ACTIONS
  // =========================

  /**
   * Handles all actions taken on a job, performing the action and afterwards updating the job state and sending chat messages.
   * Locally copies the job first so that it doesn't update the view before the action has been registered on firebase
   */
  async handleJobAction(job: Job, action: IJobAction): Promise<boolean> {
    console.log('job.service / handleJobAction: ' + action.type)
    const parsedJob = new Job(await this.parseJobToObject(job))
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        switch (action.type) {
          case ActionType.createJob:
            parsedJob.actionLog.push(action)
            parsedJob.state = JobState.offer
            await this.saveJobFirebase(parsedJob)
            await this.jobNotificationService.notify(action.type, job.id)
            // note - chat service is handled in post.component for this action ONLY
            resolve(true)
            break
          case ActionType.cancelJob:
            parsedJob.actionLog.push(action)
            parsedJob.state = JobState.cancelled
            await this.saveJobAndNotify(parsedJob, action)
            resolve(true)
            break
          case ActionType.cancelJobEarly:
            // implemented only on bsc chain

            let bscConnected = await this.bscService.isBscConnected()
            if (!bscConnected) {
              reject('connect')
              const routerStateSnapshot = this.router.routerState.snapshot
              this.toastr.warning('Please connect your wallet', '', {
                timeOut: 2000,
              })
              this.router.navigate(['/wallet-bnb'], {
                queryParams: { returnUrl: routerStateSnapshot.url },
              })
            } else {
              let result = await this.bscService.releaseByProvider(job.id)

              if (!result.err) {
                // add action log
                parsedJob.actionLog.push(action)
                parsedJob.state = JobState.cancelledByProvider // state is cancelled, like plain cancel, no more actions possible
                // add transaction to job log
                let tx = await this.transactionService.createTransaction(
                  `Cancel job early`,
                  result.transactionHash,
                  job.id
                )

                /* 
                sync job to firestore and
                handle notifications into chatService and jobNotificationService
                */
                await this.saveJobAndNotify(parsedJob, action)

                resolve(true)
              } else {
                reject(result.err)
              }
            }

            break
          case ActionType.counterOffer:
            parsedJob.actionLog.push(action)
            parsedJob.state =
              action.executedBy === UserType.client
                ? JobState.clientCounterOffer
                : JobState.providerCounterOffer
            parsedJob.budget = action.amountUsd
            await this.saveJobAndNotify(parsedJob, action)
            resolve(true)
            break
          case ActionType.acceptTerms:
            parsedJob.actionLog.push(action)
            parsedJob.state = JobState.termsAcceptedAwaitingEscrow
            await this.saveJobAndNotify(parsedJob, action)
            resolve(true)
            break
          case ActionType.declineTerms:
            parsedJob.actionLog.push(action)
            parsedJob.state = JobState.declined
            await this.saveJobAndNotify(parsedJob, action)
            resolve(true)
            break
          case ActionType.addMessage:
            parsedJob.actionLog.push(action)
            await this.saveJobAndNotify(parsedJob, action)
            resolve(true)
            break
          case ActionType.finishedJob:
            parsedJob.actionLog.push(action)
            parsedJob.state = JobState.workPendingCompletion
            await this.saveJobAndNotify(parsedJob, action)
            resolve(true)
            break
          case ActionType.dispute:
            parsedJob.actionLog.push(action)
            parsedJob.state = JobState.inDispute
            await this.saveJobAndNotify(parsedJob, action)
            resolve(true)
            break
          case ActionType.review:
            const reviewer = await this.userService.getUser(
              action.executedBy === UserType.client
                ? job.clientId
                : job.providerId
            )
            const reviewee = await this.userService.getUser(
              action.executedBy === UserType.client
                ? job.providerId
                : job.clientId
            )
            await this.reviewService.newReview(
              reviewer,
              reviewee,
              parsedJob,
              action
            )
            parsedJob.actionLog.push(action)
            await this.saveJobFirebase(parsedJob)
            resolve(true)
            break
          case ActionType.enterEscrowBsc:
            // saving will be done from backend, this updates are only for ui
            parsedJob.actionLog.push(action); // only local copy
            parsedJob.state = JobState.inEscrow; // only local copy
            parsedJob.bscEscrow = true; // save bscEscrow property into job to use it later when releasing job, only local copy
            
            // moved (chat and email) to backend 
            // await this.jobNotify(parsedJob, action); 
            
            resolve(true)
            break
          case ActionType.acceptFinish:
            parsedJob.actionLog.push(action)
            parsedJob.state = JobState.complete
            await this.saveJobAndNotify(parsedJob, action)
            resolve(true)
            break
          default:
            reject(false)
        }
      } catch (e) {
        reject(e)
      }
    })
  }

  async saveJobAndNotify(job: Job, action: IJobAction) {
    await this.saveJobFirebase(job)
    await this.chatService.sendJobMessages(job, action)

    await this.jobNotificationService.notify(action.type, job.id)
  }
  
  /*
  // moved to backend
  async jobNotify(job: Job, action: IJobAction) {
    await this.chatService.sendJobMessages(job, action) // moved to backend functions/src/chat-notifications.ts

    await this.jobNotificationService.notify(action.type, job.id)
  }
  */

  async saveJobFirebase(job: Job): Promise<any> {
    const x = await this.parseJobToObject(job)
    return this.jobsCollection.doc(job.id).set(x)
  }

  async createJobChat(
    job: Job,
    action: IJobAction,
    client: User,
    provider: User
  ) {
    const channelId = await this.chatService.createChannelsAsync(
      client,
      provider
    )
    if (channelId) {
      this.chatService.sendJobMessages(job, action)
    }
  }

  // =========================
  //      JOB HELPERS
  // =========================

  /** Helper method to get the actions that are able to be performed on a job, based on its state and the user type */
  getAvailableActions(jobState: JobState, forClient: boolean): ActionType[] {
    const actions = {}

    actions[JobState.offer] = forClient
      ? [ActionType.cancelJob]
      : [
          ActionType.acceptTerms,
          ActionType.counterOffer,
          ActionType.declineTerms,
        ]
    actions[JobState.providerCounterOffer] = forClient
      ? [
          ActionType.acceptTerms,
          ActionType.counterOffer,
          ActionType.declineTerms,
        ]
      : [ActionType.cancelJob]
    actions[JobState.clientCounterOffer] = forClient
      ? [ActionType.cancelJob]
      : [
          ActionType.acceptTerms,
          ActionType.counterOffer,
          ActionType.declineTerms,
        ]
    actions[JobState.termsAcceptedAwaitingEscrow] = forClient
      ? [ActionType.enterEscrow, ActionType.cancelJob]
      : [ActionType.cancelJob]
    actions[JobState.inEscrow] = forClient
      ? [ActionType.dispute, ActionType.addMessage]
      : [
          ActionType.finishedJob,
          ActionType.addMessage,
          ActionType.cancelJobEarly,
        ]
    actions[JobState.workPendingCompletion] = forClient
      ? [ActionType.acceptFinish, ActionType.dispute, ActionType.addMessage]
      : [ActionType.dispute, ActionType.addMessage]
    actions[JobState.inDispute] = forClient
      ? [ActionType.acceptFinish, ActionType.addMessage]
      : [ActionType.addMessage]
    actions[JobState.cancelled] = []
    actions[JobState.cancelledByProvider] = []
    actions[JobState.processingEscrow] = []
    actions[JobState.finishingJob] = []
    actions[JobState.declined] = []
    actions[JobState.complete] = [ActionType.review]
    actions[JobState.reviewed] = []

    return actions[jobState] || []
  }

  /** Job object must be re-assigned as firebase doesn't accept strong types */
  parseJobToObject(job: Job): Promise<object> {
    const parsedAttachments: Array<any> = []
    job.information.attachments.forEach((attachment: Upload) => {
      parsedAttachments.push(this.parseUpload(attachment))
    })
    const parsedInfo = Object.assign({}, job.information)
    parsedInfo.attachments = parsedAttachments

    const parsedPayments: Array<any> = []
    job.paymentLog.forEach((payment: Payment) => {
      parsedPayments.push(Object.assign({}, payment))
    })

    const parsedActions: Array<any> = []
    job.actionLog.forEach((action: IJobAction) => {
      parsedActions.push(Object.assign({}, action))
    })

    const parsedJob = Object.assign({}, job)
    parsedJob.information = parsedInfo
    parsedJob.paymentLog = parsedPayments
    parsedJob.actionLog = parsedActions
    return Promise.resolve(parsedJob)
  }

  private parseUpload(upload: Upload): any {
    const parsedUpload: any = Object.assign({}, upload)
    return parsedUpload
  }
}
