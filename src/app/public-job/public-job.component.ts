import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { User, UserType } from '@class/user';
import { PublicJobService } from '@service/public-job.service';
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
  currentJob: Job;
  currentUser: User;

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
          } else {
            this.currentJob = publicJob;
            this.jobExists = true;
            if (this.currentJob.draft === false) {
              this.canSee = true;
            } else if (this.currentJob.draft === true && this.currentJob.clientId === this.currentUser.address) {
              this.canSee = true;
              this.myJob = true;
            } else {
              this.canSee = false;
            }
          }
        });
      }
    });
  }

}
