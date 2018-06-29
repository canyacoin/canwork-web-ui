import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';

import { Job, PaymentType, TimeRange, WorkType } from '../core-classes/job';
import { Upload } from '../core-classes/upload';
import { User } from '../core-classes/user';
import { AuthService } from './auth.service';

@Injectable()
export class JobService {

  jobsCollection: AngularFirestoreCollection<any>;
  // usersJobs: Observable<Job[]>;

  constructor(private afs: AngularFirestore, private authService: AuthService) {
    this.jobsCollection = this.afs.collection<any>('jobs');
    // this.authService.currentUser$.subscribe((user: User) => {
    //   if (user) {
    //     this.usersJobs = this.jobsCollection.snapshotChanges().map(changes => {
    //       return changes.map(a => {
    //         const data = a.payload.doc.data() as Job;
    //         data.id = a.payload.doc.id;
    //         return data;
    //       });
    //     });
    //   } else {
    //     this.usersJobs = new Observable<Job>();
    //   }
    // });
  }


  postJob(job: Job): Promise<boolean> {
    return new Promise(async (resolve: any, reject: any) => {
      try {
        const x = await this.parseJobToObject(job);
        await this.jobsCollection.doc(job.id).set(x);
        resolve(true);
      } catch (e) {
        reject(false);
      }
    });
  }



  parseJobToObject(job: Job): Promise<object> {
    const parsedAttachments: Array<any> = [];
    job.information.attachments.forEach((attachment: Upload) => {
      parsedAttachments.push(this.parseUpload(attachment));
    });
    const parsedInfo = Object.assign({}, job.information);
    parsedInfo.attachments = parsedAttachments;
    const parsedJob = Object.assign({}, job);
    parsedJob.information = parsedInfo;
    return Promise.resolve(parsedJob);
  }

  private parseUpload(upload: Upload): any {
    // const parsedFile = {};
    // // tslint:disable-next-line:forin
    // for (const k in upload.file) {
    //   parsedFile[k] = upload.file[k];
    // }
    const parsedUpload: any = Object.assign({}, upload);
    // parsedUpload.file = parsedFile;
    return parsedUpload;
  }
}
