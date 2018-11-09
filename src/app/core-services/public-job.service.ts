import { Injectable } from '@angular/core';
import { Job, JobDescription } from '@class/job';

@Injectable()
export class PublicJobService {

  constructor() { }

  getPublicJob(id: string) {

  }

  // BASIC CRUDs

  createPublicJob() {
    // create the public job
  }

  uploadPublicJob() {
    // submit the public job
  }

  closePublicJob(job: Job, providerId: string) {
    // closes the public job, create a new job object and starts the usual job flow.
    job.providerId = providerId;
  }

}
