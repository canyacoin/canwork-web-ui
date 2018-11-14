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
  shareableLink: string;
  loading: boolean;
  job: Job;
  currentUser: User;
  jobPoster: User;

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private userService: UserService,
    private publicJobsService: PublicJobService
  ) {
    this.loading = true;
  }

  async ngOnInit() {
    this.shareableLink = '' + window.location.origin;
    this.authSub = this.authService.currentUser$.subscribe((user: User) => {
      this.currentUser = user;
    });
    this.activatedRoute.params.pipe(take(1)).subscribe((params) => {
      if (params['jobId']) {
        this.jobSub = this.publicJobsService.getPublicJob(params['jobId']).subscribe(publicJob => {
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
            this.setClient(this.job.clientId);
          }
        });
      } else if (params['friendlyUrl']) {
        this.jobSub = this.publicJobsService.getPublicJobsByUrl(params['friendlyUrl']).subscribe(publicJob => {
          if (publicJob.length === 0) {
            this.jobExists = false;
            this.canSee = false;
          } else {
            this.job = publicJob[0] as Job;
            this.canSee = true;
            this.setClient(this.job.clientId);
          }
        });
      }
    });
    this.loading = false;
  }
  async setClient(clientId) {
    this.jobPoster = await this.userService.getUser(clientId);
    console.log(this.jobPoster);
  }
  shareJob() {
  }

  initJob() {
  }

  copyLink() {
    let link = '';
    if (this.job.friendlyUrl) {
      link = this.shareableLink + '/jobs/public/' + this.job.friendlyUrl;
    } else {
      link = this.shareableLink + '/jobs/' + this.job.id;
    }
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = link;
    document.body.appendChild(selBox);
    selBox.select();
    selBox.focus();
    console.log(document.execCommand('copy'));
    document.body.removeChild(selBox);
    document.getElementById('copied').style.display = 'block';
    setTimeout(function () {
      document.getElementById('copied').style.display = 'none';
    }, 2000);
  }
}
