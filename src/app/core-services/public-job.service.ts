import { Injectable } from '@angular/core'
import { Job, JobState, Bid } from '@class/job'
import { User, UserType } from '@class/user'
import { UserService } from '@service/user.service'
import { JobService } from '@service/job.service'
import { AuthService } from '@service/auth.service'
import { ActionType, IJobAction } from '@class/job-action'
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/firestore'
import { AngularFireFunctions } from '@angular/fire/functions'
import { Observable, of } from 'rxjs'
import { map, tap, take, switchMap, catchError } from 'rxjs/operators'
import { ChatService } from '@service/chat.service'
import slugify from 'slugify'
import { Random } from 'random-js'

@Injectable()
export class PublicJobService {
  publicJobsCollection: AngularFirestoreCollection<any>
  constructor(
    private afs: AngularFirestore,
    private chatService: ChatService,
    private userService: UserService,
    private auth: AuthService,
    private jobService: JobService,
    private fns: AngularFireFunctions
  ) {
    this.publicJobsCollection = this.afs.collection<any>('public-jobs')
  }

  // BASIC GETs

  getPublicJob(jobId: string): Observable<Job> {
    return this.afs
      .doc<Job>(`public-jobs/${jobId}`)
      .valueChanges()
      .pipe(
        catchError((err) => {
          console.log('Error', err)
          throw err
        })
      )
  }

  async getPublicJobAsObject(jobId: string) {
    const jobPromise = await this.afs
      .doc(`public-jobs/${jobId}`)
      .snapshotChanges()
      .toPromise()
    if (jobPromise) {
      const job = jobPromise.payload.data() as Job
      if (job) {
        return job
      } else {
        return null
      }
    }
    return null
  }

  getPublicJobBids(jobId: string): Observable<any> {
    return this.afs
      .collection(`public-jobs/${jobId}/bids`)
      .snapshotChanges()
      .pipe(
        map((docs) => {
          const bids = []
          docs.forEach((doc) => {
            bids.push(doc.payload.doc.data() as Bid)
          })
          return bids
        })
      )
  }

  getAllOpenJobs(): Observable<Job[]> {
    return this.afs
      .collection<Job>(`public-jobs`, (ref) =>
        ref
          .where('visibility', '==', 'public')
          .where('state', '==', JobState.acceptingOffers)
          .where('deadline', '>', new Date().toISOString().slice(0, 10))
      )
      .valueChanges()
  }

  /*
   this is old version
   using a firebase backend function
   that is affected by cold start performance issue
  */
  /*
  getPublicJobBySlug(slug: string): Observable<Job> {
    const startTime = Date.now() // debug profile
    return this.fns
      .httpsCallable<{ slug: string }, string>('getPublicJobIdBySlug')({ slug })
      .pipe(
        switchMap((jobId) => {
          const endTime = Date.now() // debug profile
          console.log(
            `time spent by getPublicJobBySlug ${slug}: ${
              endTime - startTime
            } ms`
          ) // debug profile          
          return jobId
            ? this.afs.doc<Job>(`public-jobs/${jobId}`).valueChanges()
            : of<null>(null)
        })
      )
  }
  */

  // new, nov 23, direct db call, observable
  getPublicJobBySlug(slug: string): Observable<Job> {
    const startTime = Date.now() // debug profile

    return this.afs
      .collection<Job>('public-jobs', (ref) =>
        ref
          .where('visibility', '==', 'public')
          /* we need this to filter only jobs we can "actually" see
             and avoid firebase permissions issues into browser logs */
          .where('slug', '==', slug)
      )
      .valueChanges()
      .pipe(
        /*
          this is how to observe a single doc
          when the doc ID is not known beforehand
          
          we don't use here do take(1) here
          cause it completes the observable
          and then you will stop listening for changes
          
          the RxJS tap operator in RxJS is used to perform side effects
          for each emitted value from an observable stream,
          without modifying or transforming the values themselves          
          */
        tap((docs) => {
          const endTime = Date.now() // debug profile
          console.log(
            `time spent by getPublicJobBySlug ${slug}: ${
              endTime - startTime
            } ms`
          ) // debug profile
        }),
        map((val) => (val.length > 0 ? val[0] : null))
      )
  }

  async getPublicJobByUrl(friendly) {
    const exist = await this.afs
      .collection(`public-jobs`, (ref) => ref.where('slug', '==', friendly))
      .valueChanges()
      .take(1)
      .toPromise()
    return exist
  }

  async getPublicJobInvites(jobId) {
    const exist = await this.afs
      .collection(`public-jobs/${jobId}/invites`)
      .valueChanges()
      .take(1)
      .toPromise()
    return exist
  }

  getPublicJobsByUser(userId: string): Observable<Job[]> {
    return this.afs
      .collection<any>('public-jobs', (ref) =>
        ref.where('clientId', '==', userId)
      )
      .snapshotChanges()
      .pipe(
        map((changes) => {
          return changes.map((a) => {
            const data = a.payload.doc.data() as Job
            data.id = a.payload.doc.id
            return data
          })
        })
      )
  }

  async getOpenPublicJobsByUser(userId: string) {
    const exist = (await this.afs
      .collection(`public-jobs/`, (ref) => ref.where('clientId', '==', userId))
      .valueChanges()
      .pipe(take(1))
      .toPromise()) as Job[]
    let result: Job[]
    result = exist.filter(
      (job) => job.state === 'Accepting Offers' && !job.draft
    )
    // sort from latest to oldest
    result.sort((a, b) => {
      if (a.actionLog[0].timestamp > b.actionLog[0].timestamp) {
        return -1
      }
      if (a.actionLog[0].timestamp < b.actionLog[0].timestamp) {
        return 1
      }
      return 0
    })
    return result
  }

  // BASIC CRUDs
  async handlePublicJob(job, action: IJobAction): Promise<boolean> {
    console.log('uploading job...')
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        await this.saveJobFirebase(job, action)
        resolve(true)
      } catch (error) {
        console.log(error)
        reject(false)
      }
    })
  }

  // save the public job
  private async saveJobFirebase(job: Job, action: IJobAction): Promise<any> {
    if (action && action !== null) {
      job.actionLog.push(action)
    }
    const parsedJob = await this.jobService.parseJobToObject(job)
    try {
      return this.publicJobsCollection.doc(job.id).set(parsedJob)
    } catch (error) {
      console.log(error)
    }
  }

  async isMyJob(jobId, id) {
    const job = await this.getPublicJobAsObject(jobId)
    if (job.clientId === id) {
      return true
    } else {
      return false
    }
  }

  async handlePublicBid(bid: Bid, job: Job) {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        if (this.canBid(bid.providerId, job)) {
          const action = new IJobAction(ActionType.bid, UserType.provider)
          const client = await this.userService.getUser(job.clientId)
          const provider = await this.userService.getUser(bid.providerId)
          await this.addBid(bid, job.id)
          await this.sendPublicJobMessage(job, action, client, provider)
          resolve(true)
        } else {
          console.log("can't upload bid...")
          reject(false)
        }
      } catch (error) {
        console.log('something went wrong. try again later.')
        reject(false)
      }
    })
  }

  // checks if the provider exists in the job bid
  async canBid(providerId: string, job: Job) {
    const bid = await this.afs
      .collection<any>(`public-jobs/${job.id}/bids/`, (ref) =>
        ref.where('providerId', '==', providerId)
      )
      .get()
      .toPromise()
    return bid.empty
  }

  // add new bid to collection
  private async addBid(bid: Bid, jobId: string): Promise<Boolean> {
    const bidToUpload = this.parseBidToObject(bid)
    return new Promise<boolean>((resolve, reject) => {
      this.afs
        .doc(`public-jobs/${jobId}/bids/${bid.providerId}`)
        .set(bidToUpload)
        .then((result) => {
          resolve(true)
        })
        .catch((e) => {
          reject(false)
        })
    })
  }

  async getBids(jobId: string) {
    const result = this.afs
      .collection('public-jobs')
      .doc(jobId)
      .collection('bids')
      .valueChanges()
      .pipe(take(1))
      .toPromise()
    return result
  }

  async jobExists(jobId) {
    const exist = await this.afs
      .doc(`public-jobs/${jobId}`)
      .valueChanges()
      .take(1)
      .toPromise()
    return exist
  }

  async jobUrlExists(slug: string): Promise<boolean> {
    return await this.fns
      .httpsCallable<{ slug: string }, boolean>('publicJobExists')({ slug })
      .toPromise()
  }

  cancelJob(jobId: string) {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        const update = await this.afs
          .doc(`public-jobs/${jobId}`)
          .update({ state: JobState.closed })
        console.log(update)
        resolve(true)
      } catch (error) {
        console.log(error)
        reject(false)
      }
    })
  }

  closePublicJob(job: Job, bid: Bid) {
    // closes the public job, create a new job object and starts the usual job flow.
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        const newJob = job
        newJob.providerId = bid.providerId
        newJob.state = JobState.termsAcceptedAwaitingEscrow
        newJob.budget = bid.budget
        const acceptTerms = new IJobAction(
          ActionType.acceptTerms,
          UserType.client
        )
        const success = await this.jobService.handleJobAction(
          newJob,
          acceptTerms
        )
        if (success) {
          job.state = JobState.closed
          this.saveJobFirebase(job, null)
          resolve(true)
        } else {
          reject(false)
        }
      } catch (error) {
        console.log(error)
        reject(false)
      }
    })
  }

  declineBid(job: Job, bid: Bid) {
    //  Decline the bid.
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        const update = await this.afs
          .doc(`public-jobs/${job.id}/bids/${bid.providerId}`)
          .update({ rejected: true })
        console.log(update)
        resolve(true)
      } catch (error) {
        console.log(error)
        reject(false)
      }
    })
  }

  async generateReadableId(jobName) {
    let slug = slugify(jobName, { lower: true })
    const exists = await this.jobUrlExists(slug)
    if (!exists) {
      // console.log('just upload it')
    } else {
      console.log('wait might want to change the url mate')
      const random = new Random()
      slug = slugify(jobName + ' ' + random.string(7), { lower: true })
      console.log('new url : ' + slug)
    }
    return slug
  }

  parseBidToObject(bid: Bid): Object {
    // firebase don't allow us to upload custom object so we have to use this workaround
    const bidObject = Object.assign({}, bid)
    bidObject.message = bid.message
    bidObject.providerId = bid.providerId
    bidObject.providerInfo = bid.providerInfo
    bidObject.budget = bid.budget
    bidObject.timestamp = bid.timestamp
    return bidObject
  }

  async sendPublicJobMessage(
    job: Job,
    action: IJobAction,
    client: User,
    provider: User
  ) {
    const channelId = await this.chatService.createChannelsAsync(
      provider,
      client
    )
    const sender = await this.auth.getCurrentUser()
    if (channelId) {
      await this.chatService.sendPublicJobMessages(
        job,
        action,
        provider.address,
        sender
      )
    }
  }

  async notifyLosers(job: Job, client: User, bids: any) {
    if (bids.length === 0) {
      return
    }
    try {
      const declineBidAction = new IJobAction(
        ActionType.declineBid,
        UserType.client
      )
      const bid = bids.pop()
      const provider = await this.userService.getUser(bid.providerId)
      this.sendPublicJobMessage(job, declineBidAction, client, provider)
      this.notifyLosers(job, client, bids)
    } catch (error) {
      console.error(error)
    }
  }

  async inviteProvider(job: Job, client: User, provider: User) {
    const ref = this.afs.firestore.doc(`public-jobs/${job.id}`)
    try {
      const invited = await this.afs.firestore.runTransaction(async (tx) => {
        const snap = await tx.get(ref)
        const invites = (snap.get('invites') as string[]) || []
        const userId = provider.address
        if (!invites.includes(userId)) {
          invites.push(userId)
          await tx.update(ref, { invites })
        }
        return true
      })

      if (invited) {
        const invite = new IJobAction(ActionType.invite, UserType.client)
        await this.sendPublicJobMessage(job, invite, client, provider)
        return true
      }
    } catch (err) {
      console.log(err)
      return false
    }
  }

  async canInvite(jobId: string, providerId: string) {
    const snap = await this.afs.firestore.doc(`public-jobs/${jobId}`).get()
    const invites = (snap.get('invites') as string[]) || []
    return !invites.includes(providerId)
  }
}
