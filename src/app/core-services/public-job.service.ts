import { Injectable } from '@angular/core';
import { Job, JobState, Bid } from '@class/job';
import { User, UserType } from '@class/user';
import { UserService } from '@service/user.service';
import { JobService } from '@service/job.service';
import { ActionType, IJobAction } from '@class/job-action';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable, ReplaySubject } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { ChatService } from '@service/chat.service';
import { createChangeDetectorRef } from '@angular/core/src/view/refs';
import { JobNotificationService } from './job-notification.service';

@Injectable()
export class PublicJobService {
  publicJobsCollection: AngularFirestoreCollection<any>;
  constructor(
    private afs: AngularFirestore,
    private chatService: ChatService,
    private userService: UserService,
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

  getPublicJobBids(jobId: string): Observable<any> {
    return this.afs.collection(`public-jobs/${jobId}/bids`).snapshotChanges().pipe(map(docs => {
      const bids = [];
      docs.forEach((doc) => {
        bids.push(doc.payload.doc.data() as Bid);
      });
      return bids;
    }));
  }

  getPublicJobsByUrl(url: string): Observable<Job> {
    return this.afs.collection<any>('public-jobs', ref => ref.where('friendlyUrl', '==', url)).snapshotChanges().pipe(map(changes => {
      if (changes.length > 0) {
        return (changes[0].payload.doc.data());
      } else {
        return null;
      }
    }));
  }

  async getPublicJobByUrl(friendly) {
    const exist = await this.afs.collection(`public-jobs`, ref => ref.where('friendlyUrl', '==', friendly)).valueChanges().take(1).toPromise();
    return exist;
  }

  getPublicJobsByUser(userId: string, userType: UserType): Observable<Job[]> {
    return this.afs.collection<any>('public-jobs', ref => ref.where('clientId', '==', userId)).snapshotChanges().pipe(map(changes => {
      return changes.map(a => {
        const data = a.payload.doc.data() as Job;
        data.id = a.payload.doc.id;
        return data;
      });
    }));
  }

  // BASIC CRUDs
  async handlepublicJob(job, action: IJobAction): Promise<boolean> {
    console.log('uploading job...');
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        await this.saveJobFirebase(job, action);
        resolve(true);
      } catch (error) {
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
    return this.publicJobsCollection.doc(job.id).set(parsedJob);
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
          const channelId = await this.chatService.createChannelsAsync(provider, client);
          if (channelId) {
            console.log(channelId);
            await this.chatService.sendPublicJobMessages(job, action, bid.providerId);
            resolve(true);
          }
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
    const exist = await this.afs.collection('public-jobs', ref => ref.where('friendlyUrl', '>=', friendlyQuery)).valueChanges().take(1).toPromise();
    return exist;
  }

  closePublicJob(job: Job, bid: Bid) {
    // closes the public job, create a new job object and starts the usual job flow.
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        job.providerId = bid.providerId;
        job.state = JobState.termsAcceptedAwaitingEscrow;
        job.budget = bid.budget;
        await this.saveJobFirebase(job, null);
        const action = new IJobAction(ActionType.acceptTerms, UserType.client);
        await this.jobService.handleJobAction(job, action);
        resolve(true);
      } catch (error) {
        reject(false);
      }
    });
  }

  declineBid(job: Job, bid: Bid) {
    //  Decline the bid. still WIP
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
    // take the job name, take the first 2 strings.
    const filteredName = jobName.replace(/[0-9]/g, '');
    const nameArray = filteredName.split(' ');
    let friendly: string;
    if (nameArray.length > 1) {
      friendly = nameArray[0] + '-' + nameArray[1];
    } else if (nameArray.length >= 2) {
      friendly = nameArray[0] + '-' + nameArray[1] + '-' + nameArray[2];
    } else {
      friendly = nameArray[0];
    }
    console.log(jobName + ' = filtered to = ' + friendly);
    friendly = friendly.toLowerCase();
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
}
