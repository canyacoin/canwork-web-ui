import { Injectable } from '@angular/core';
import { Job, JobState, Bid } from '@class/job';
import { User, UserType } from '@class/user';
import { UserService } from '@service/user.service';
import { JobService } from '@service/job.service';
import { AuthService } from '@service/auth.service';
import { ActionType, IJobAction } from '@class/job-action';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { ChatService } from '@service/chat.service';
import * as moment from 'moment';
import slugify from 'slugify';

@Injectable()
export class PublicJobService {
  publicJobsCollection: AngularFirestoreCollection<any>;
  constructor(
    private afs: AngularFirestore,
    private chatService: ChatService,
    private userService: UserService,
    private auth: AuthService,
    private jobService: JobService
  ) {
    this.publicJobsCollection = this.afs.collection<any>('public-jobs');
  }

  // BASIC GETs

  getPublicJob(jobId: string): Observable<Job> {
    return this.afs.doc(`public-jobs/${jobId}`).snapshotChanges().pipe(map(doc => {
      const job = doc.payload.data() as Job;
      if (job) {
        console.log('job found.');
      } else {
        console.log('job not found.');
      }
      return job;
    }));
  }

  async getPublicJobAsObject(jobId: string) {
    const jobPromise = await this.afs.doc(`public-jobs/${jobId}`).snapshotChanges().toPromise();
    if (jobPromise) {
      const job = jobPromise.payload.data() as Job;
      if (job) {
        return job;
      } else {
        return null;
      }
    }
    return null;
  }

  getPublicJobBids(jobId: string): Observable<any> {
    return this.afs.collection(`public-jobs/${jobId}/bids`).snapshotChanges().pipe(map(docs => {
      const bids = [];
      docs.forEach((doc) => {
        bids.push(doc.payload.doc.data() as Bid);
      });
      return bids;
    }));
  }

  getAllOpenJobs(): Observable<any> {
    return this.afs.collection(`public-jobs`).snapshotChanges().pipe(map(docs => {
      const jobs = [];
      docs.forEach((doc) => {
        const currentJob = doc.payload.doc.data() as Job;
        if (currentJob.state === JobState.acceptingOffers && currentJob.visibility === 'public' && new Date(currentJob.deadline) > new Date()) {
          jobs.push(currentJob);
        }
      });
      return jobs;
    }));
  }

  getPublicJobsByUrl(url: string): Observable<Job> {
    return this.afs.collection<any>('public-jobs', ref => ref.where('slug', '==', url)).snapshotChanges().pipe(map(changes => {
      if (changes.length > 0) {
        return (changes[0].payload.doc.data());
      } else {
        return null;
      }
    }));
  }

  async getPublicJobByUrl(friendly) {
    const exist = await this.afs.collection(`public-jobs`, ref => ref.where('slug', '==', friendly)).valueChanges().take(1).toPromise();
    return exist;
  }

  async getPublicJobInvites(jobId) {
    const exist = await this.afs.collection(`public-jobs/${jobId}/invites`).valueChanges().take(1).toPromise();
    return exist;
  }

  getPublicJobsByUser(userId: string): Observable<Job[]> {
    return this.afs.collection<any>('public-jobs', ref => ref.where('clientId', '==', userId)).snapshotChanges().pipe(map(changes => {
      return changes.map(a => {
        const data = a.payload.doc.data() as Job;
        data.id = a.payload.doc.id;
        return data;
      });
    }));
  }

  async getOpenPublicJobsByUser(userId: string) {
    const exist = await this.afs.collection(`public-jobs/`, ref => ref.where('clientId', '==', userId)).valueChanges().take(1).toPromise() as Job[];
    let result: Job[];
    result = exist.filter(job => job.state === 'Accepting Offers' && !job.draft);
    // sort from latest to oldest
    result.sort((a, b) => {
      if (a.actionLog[0].timestamp > b.actionLog[0].timestamp) {
        return -1;
      }
      if (a.actionLog[0].timestamp < b.actionLog[0].timestamp) {
        return 1;
      }
      return 0;
    });
    return result;
  }

  // BASIC CRUDs
  async handlePublicJob(job, action: IJobAction): Promise<boolean> {
    console.log('uploading job...');
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        await this.saveJobFirebase(job, action);
        resolve(true);
      } catch (error) {
        console.log(error);
        reject(false);
      }
    });
  }

  // save the public job
  private async saveJobFirebase(job: Job, action: IJobAction): Promise<any> {
    if (action && action !== null) {
      job.actionLog.push(action);
    }
    console.log('added action to this job\'s action log');
    const parsedJob = await this.jobService.parseJobToObject(job);
    try {
      return this.publicJobsCollection.doc(job.id).set(parsedJob);
    } catch (error) {
      console.log(error);
    }
  }

  async isMyJob(jobId, id) {
    const job = await this.getPublicJobAsObject(jobId);
    if (job.clientId === id) {
      return true;
    } else {
      return false;
    }
  }

  async handlePublicBid(bid: Bid, job: Job) {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        if (this.canBid(bid.providerId, job)) {
          console.log('uploading the bid');
          const action = new IJobAction(ActionType.bid, UserType.provider);
          const client = await this.userService.getUser(job.clientId);
          const provider = await this.userService.getUser(bid.providerId);
          await this.addBid(bid, job.id);
          await this.sendPublicJobMessage(job, action, client, provider);
          resolve(true);
        } else {
          console.log('can\'t upload bid...');
          reject(false);
        }
      } catch (error) {
        console.log('something went wrong. try again later.');
        reject(false);
      }
    });
  }

  // checks if the provider exists in the job bid
  async canBid(providerId: string, job: Job) {
    const bid = await this.afs.collection<any>(`public-jobs/${job.id}/bids/`, ref => ref.where('providerId', '==', providerId)).get().toPromise();
    return bid.empty;
  }

  // add new bid to collection
  private async addBid(bid: Bid, jobId: string): Promise<Boolean> {
    const bidToUpload = this.parseBidToObject(bid);
    return new Promise<boolean>((resolve, reject) => {
      this.afs.doc(`public-jobs/${jobId}/bids/${bid.providerId}`).set(bidToUpload).then(result => {
        resolve(true);
      }).catch(e => {
        reject(false);
      });
    });
  }

  async getBids(jobId: string) {
    const result = this.afs.collection('public-jobs').doc(jobId).collection('bids').valueChanges().pipe(take(1)).toPromise();
    return result;
  }

  async jobExists(jobId) {
    const exist = await this.afs.doc(`public-jobs/${jobId}`).valueChanges().take(1).toPromise();
    return exist;
  }

  async jobUrlExists(friendlyQuery) {
    const exist = await this.afs.collection('public-jobs', ref => ref.where('slug', '>=', friendlyQuery)).valueChanges().take(1).toPromise();
    return exist;
  }

  cancelJob(jobId: string) {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        const update = await this.afs.doc(`public-jobs/${jobId}`).update({ state: JobState.closed });
        console.log(update);
        resolve(true);
      } catch (error) {
        console.log(error);
        reject(false);
      }
    });
  }

  closePublicJob(job: Job, bid: Bid) {
    // closes the public job, create a new job object and starts the usual job flow.
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        const newJob = job;
        newJob.providerId = bid.providerId;
        newJob.state = JobState.termsAcceptedAwaitingEscrow;
        newJob.budget = bid.budget;
        const acceptTerms = new IJobAction(ActionType.acceptTerms, UserType.client);
        const success = await this.jobService.handleJobAction(newJob, acceptTerms);
        if (success) {
          job.state = JobState.closed;
          this.saveJobFirebase(job, null);
          resolve(true);
        } else {
          reject(false);
        }
      } catch (error) {
        console.log(error);
        reject(false);
      }
    });
  }

  declineBid(job: Job, bid: Bid) {
    //  Decline the bid.
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        const update = await this.afs.doc(`public-jobs/${job.id}/bids/${bid.providerId}`).update({ rejected: true });
        console.log(update);
        resolve(true);
      } catch (error) {
        console.log(error);
        reject(false);
      }
    });
  }

  async generateReadableId(jobName) {
    let friendly = slugify(jobName, {lower: true});
    console.log(jobName + ' = filtered to = ' + friendly);
    const exists = await this.jobUrlExists(friendly);
    console.log(exists);
    if (exists.length < 1) {
      console.log('just upload it');
    } else {
      console.log('wait might want to change the url mate');
      friendly = friendly + '-' + exists.length;
      console.log('new url : ' + friendly);
    }
    return friendly;
  }

  parseBidToObject(bid: Bid): Object {
    // firebase don't allow us to upload custom object so we have to use this workaround
    const bidObject = Object.assign({}, bid);
    bidObject.message = bid.message;
    bidObject.providerId = bid.providerId;
    bidObject.providerInfo = bid.providerInfo;
    bidObject.budget = bid.budget;
    bidObject.timestamp = bid.timestamp;
    console.log('converted the bid into object');
    console.log(bidObject);
    return bidObject;
  }

  async sendPublicJobMessage(job: Job, action: IJobAction, client: User, provider: User) {
    const channelId = await this.chatService.createChannelsAsync(provider, client);
    const sender = await this.auth.getCurrentUser();
    if (channelId) {
      await this.chatService.sendPublicJobMessages(job, action, provider.address, sender);
    }
  }

  async notifyLosers(job: Job, client: User, bids: any) {
    if (bids.length === 0) { return; }
    try {
      const declineBidAction = new IJobAction(ActionType.declineBid, UserType.client);
      const bid = bids.pop();
      const provider = await this.userService.getUser(bid.providerId);
      this.sendPublicJobMessage(job, declineBidAction, client, provider);
      this.notifyLosers(job, client, bids);
    } catch (error) {
      console.error(error);
    }
  }

  async inviteProvider(job: Job, client: User, provider: User) {
    try {
      const invited = await this.inviteProviderToJob(job.id, provider.address);
      if (invited) {
        const invite = new IJobAction(ActionType.invite, UserType.client);
        await this.sendPublicJobMessage(job, invite, client, provider);
        return true;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async inviteProviderToJob(jobId, providerId) {
    const invite = {
      provider: providerId,
      timestamp: moment().format('x')
    };
    return new Promise<boolean>((resolve, reject) => {
      this.afs.doc(`public-jobs/${jobId}/invites/${providerId}`).set(invite).then(result => {
        console.log(result);
        resolve(true);
      }).catch(e => {
        reject(false);
      });
    });
  }

  async canInvite(jobId, providerId) {
    const exist = await this.afs.collection(`public-jobs/${jobId}/invites/`, ref => ref.where('provider', '==', providerId)).valueChanges().take(1).toPromise();
    return !(exist.length > 0);
  }
}
