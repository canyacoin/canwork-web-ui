import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { User, UserType } from '@class/user';
import { PublicJobService } from '@service/public-job.service';
import { UserService } from '@service/user.service';
import { AuthService } from '@service/auth.service';
import { Job, JobDescription } from '@class/job';
@Component({
  selector: 'app-public-job',
  templateUrl: './public-job.component.html',
  styleUrls: ['./public-job.component.css']
})
export class PublicJobComponent implements OnInit {
  authSub: Subscription;
  routeSub: Subscription;
  jobSub: Subscription;
  jobExists: boolean;
  canSee = false;
  myJob = false;
  job: Job;
  currentUser: User;
  jobPoster: User;

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private publicJobs: PublicJobService
  ) { }

  async ngOnInit() {
    this.authSub = this.authService.currentUser$.subscribe((user: User) => {
      this.currentUser = user;
    });
    this.activatedRoute.params.pipe(take(1)).subscribe((params) => {
      if (params['jobId']) {
        this.jobSub = this.publicJobs.getPublicJob(params['jobId']).subscribe(publicJob => {
          if (publicJob === undefined) {
            this.jobExists = false;
            this.canSee = false;
          } else {
            this.job = publicJob;
            this.jobExists = true;
            this.myJob = (this.job.clientId === this.currentUser.address);
            if (this.job.draft && !this.myJob) {
              // only allow the job creator to see jobs in draft state
              this.canSee = false;
            } else {
              this.canSee = true;
            }
          }
        });
      } else if (params['friendlyUrl']) {
        alert('Test complete');
        this.jobSub = this.publicJobs.getPublicJobsByUrl(params['friendlyUrl']).subscribe(publicJob => {
          if (publicJob.length > 0) {
            this.job = publicJob[0] as Job;
            this.canSee = true;
          }
        });
      }
    });
  }

  shareJob() {
  }

}
