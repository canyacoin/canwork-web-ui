import { Injectable } from '@angular/core';
import { Job, JobDescription } from '@class/job';
import { User, UserType } from '@class/user';
import { UserService } from '@service/user.service';
import { JobService } from '@service/job.service';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { map, } from 'rxjs/operators';
import { createChangeDetectorRef } from '@angular/core/src/view/refs';

@Injectable()
export class PublicJobService {
  publicJobsCollection: AngularFirestoreCollection<any>;
  constructor(
    private afs: AngularFirestore,
    private userService: UserService,
    private jobService: JobService
  ) {
    this.publicJobsCollection = this.afs.collection<any>('public-jobs');
  }

  // BASIC GETs

  getPublicJob(jobId: string): Observable<Job> {
    return this.afs.doc(`public-jobs/${jobId}`).snapshotChanges().pipe(map(doc => {
      const job = doc.payload.data() as Job;
      console.log(job);
      if (job !== undefined) {
        console.log('found.');
      } else {
        console.log('not found.');
      }
      return job;
    }));
  }

  getPublicJobsByUrl(url: string): Observable<Job[]> {
    return this.afs.collection<any>('public-jobs', ref => ref.where('friendlyUrl', '==', url)).snapshotChanges().pipe(map(changes => {
      return changes.map(a => {
        const data = a.payload.doc.data() as Job;
        data.id = a.payload.doc.id;
        return data;
      });
    }));
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
  async handlepublicJob(job): Promise<boolean> {
    console.log('uploading job...');
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        await this.saveJobFirebase(job);
        resolve(true);
      } catch (error) {
        reject(false);
      }
    });
  }

  // save the public job
  private async saveJobFirebase(job: Job): Promise<any> {
    const x = await this.jobService.parseJobToObject(job);
    return this.publicJobsCollection.doc(job.id).set(x);
  }

  async jobExists(jobId) {
    const exist = await this.afs.doc(`public-jobs/${jobId}`).valueChanges().take(1).toPromise();
    return exist;
  }

  async jobUrlExists(friendlyQuery) {
    console.log(friendlyQuery);
    const exist = await this.afs.collection('public-jobs', ref => ref.where('friendlyUrl', '>=', friendlyQuery)).valueChanges().take(1).toPromise();
    console.log(exist);
    return exist;
  }

  closePublicJob(job: Job, providerId: string) {
    // closes the public job, create a new job object and starts the usual job flow.
    job.providerId = providerId;
  }

  generateReadableId(jobName): string {
    // take the job name, take the first 2 strings.
    const filteredName = jobName.replace(/[0-9]/g, '');
    const nameArray = filteredName.split(' ');
    let friendly: string;
    if (nameArray.length > 1) {
      friendly = nameArray[0] + '-' + nameArray[1];
    } else {
      friendly = nameArray[0];
    }
    console.log(jobName + ' = filtered to = ' + friendly);
    friendly = friendly.toLowerCase();
    return friendly;
  }
}
