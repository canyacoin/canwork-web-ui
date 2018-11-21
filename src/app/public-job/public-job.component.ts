import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Bid, Job, JobState } from '@class/job';
import { User, UserType } from '@class/user';
import { AuthService } from '@service/auth.service';
import { PublicJobService } from '@service/public-job.service';
import { UserService } from '@service/user.service';
import { AngularFireStorage } from 'angularfire2/storage';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import * as moment from 'moment';

@Component({
  selector: 'app-public-job',
  templateUrl: './public-job.component.html',
  styleUrls: ['./public-job.component.css']
})
export class PublicJobComponent implements OnInit {
  bidForm: FormGroup = null;
  bids: any;
  authSub: Subscription;
  routeSub: Subscription;
  jobSub: Subscription;
  jobExists: boolean;
  canBid: boolean;
  isBidding: boolean;
  isOpen: boolean;
  sent = false;
  canSee = false;
  hideDescription = false;
  myJob = false;
  shareableLink: string;
  job: Job;
  currentUser: User;
  jobPoster: User;

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private userService: UserService,
    private publicJobsService: PublicJobService,
    private storage: AngularFireStorage,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.bidForm = formBuilder.group({
      price: ['', Validators.compose([Validators.required, Validators.min(1), Validators.max(10000000)])],
      message: ['', Validators.compose([Validators.min(0), Validators.maxLength(10000)])]
    });
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
            this.initJob(this.job);
          }
        });
      } else if (params['friendlyUrl']) {
        this.jobSub = this.publicJobsService.getPublicJobsByUrl(params['friendlyUrl']).subscribe(publicJob => {
          if (publicJob.length === 0) {
            this.jobExists = false;
            this.canSee = false;
          } else {
            this.job = publicJob[0] as Job;
            this.initJob(this.job);
          }
        });
      }
    });
  }

  async setClient(clientId) {
    this.jobPoster = await this.userService.getUser(clientId);
    console.log(this.jobPoster);
  }

  async initJob(job: Job) {
    this.jobExists = true;
    this.myJob = (job.clientId === this.currentUser.address);
    if (job.draft && !this.myJob) {
      // only allow the job creator to see jobs in draft state
      this.canSee = false;
    } else {
      this.canSee = true;
    }
    if (job.state === JobState.acceptingOffers) {
      this.isOpen = true;
    } else {
      this.isOpen = false;
    }
    this.setClient(this.job.clientId);
    this.setAttachmentUrl();
    if (this.currentUser.type === 'Provider') {
      const check = await this.publicJobsService.canBid(this.currentUser.address, this.job);
      this.canBid = check;
    }
    this.bids = await this.publicJobsService.getBids(job.id);
  }

  async submitBid() {
    this.isBidding = true;
    const bidToSubmit = new Bid(this.currentUser.address, this.currentUser.name, this.currentUser.avatar, this.bidForm.value.price, this.bidForm.value.message, moment().format('x'));
    console.log(bidToSubmit);
    this.sent = await this.publicJobsService.handlePublicBid(bidToSubmit, this.job);
    this.isBidding = false;
    this.canBid = false;
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

  private async setAttachmentUrl() {
    const attachment = this.job.information.attachments;
    if (attachment.length > 0) { // check if there's any attachment on this job
      if (attachment[0].url === null || attachment[0].url === undefined) { // [0] is used here since we only support single file upload anyway.
        console.log('no URL');
        if (attachment[0].filePath != null) { // Assume that it's caused by the async issue
          let getUrl: Subscription;
          const filePath = attachment[0].filePath;
          const fileRef = this.storage.ref(filePath);
          getUrl = fileRef.getDownloadURL().subscribe(result => {
            this.job.information.attachments[0].url = result;
          });
          console.log(attachment);
        }
      } else {
        console.log('Has URL');
        console.log(attachment[0].url);
      }
    }
  }

  async getProviderData(id) {
    const provider = await this.userService.getUserByEthAddress(id);
    return provider;
  }

  toLocaleDateString(timestamp) {
    const date = new Date(parseInt(timestamp, 10));
    console.log(date);
    return date.toLocaleDateString();
  }

  async chooseProvider(providerId) {
    const confirmed = confirm('Are you sure you want to choose this provider?');
    if (confirmed) {
      const chosen = await this.publicJobsService.closePublicJob(this.job, providerId);
      if (chosen) {
        alert('Provider chosen!');
        this.router.navigate(['/inbox/job', this.job.id]);
      } else {
        alert('Something went wrong. please try again later');
      }
    }
  }
  toggleDescription() {
    this.hideDescription = !this.hideDescription;
  }

}
