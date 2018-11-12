import { Injectable } from '@angular/core';
import { Job, JobDescription } from '@class/job';
import { User, UserType } from '@class/user';
import { UserService } from '@service/user.service';
import { JobService } from '@service/job.service';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';

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

  getPublicJob(jobId: string) {
    return this.afs.doc(`public-jobs/${jobId}`).snapshotChanges().map(doc => {
      const job = doc.payload.data() as Job;
      job.id = jobId;
      return job;
    });
  }

  // BASIC CRUDs


  // save the public job
  private async saveJobFirebase(job: Job): Promise<any> {
    const x = await this.jobService.parseJobToObject(job);
    return this.publicJobsCollection.doc(job.id).set(x);
  }

  closePublicJob(job: Job, providerId: string) {
    // closes the public job, create a new job object and starts the usual job flow.
    job.providerId = providerId;
  }

  bidPublicJob() {

  }
}
