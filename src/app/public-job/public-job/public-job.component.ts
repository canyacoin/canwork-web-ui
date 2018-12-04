import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Bid, Job, JobState } from '@class/job';
import { User } from '@class/user';
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
export class PublicJobComponent implements OnInit, OnDestroy {
  bidForm: FormGroup = null;
  bids: any;
  recentBids: any;
  authSub: Subscription;
  routeSub: Subscription;
  bidsSub: Subscription;
  jobSub: Subscription;
  jobExists: boolean;
  canBid: boolean;
  isBidding: boolean;
  sent = false;
  canSee = false;
  hideDescription = false;
  myJob = false;
  loading = true;
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
  ) {
    this.bidForm = this.formBuilder.group({
      price: ['', Validators.compose([Validators.required, Validators.min(1), Validators.max(10000000)])],
      message: ['', Validators.compose([Validators.min(0), Validators.maxLength(10000)])]
    });
  }

  async ngOnInit() {
    this.shareableLink = '' + window.location.origin;
    this.authSub = this.authService.currentUser$.subscribe((user: User) => {
      if (user) {
        this.currentUser = user;
      }
    });
    this.activatedRoute.params.pipe(take(1)).subscribe((params) => {
      if (params['jobId']) {
        this.jobSub = this.publicJobsService.getPublicJob(params['jobId']).subscribe(publicJob => {
          if (publicJob === undefined) {
            this.jobExists = false;
            this.canSee = false;
            this.loading = false;
          } else {
            this.job = publicJob;
            this.initJob(this.job);
            this.bidsSub = this.publicJobsService.getPublicJobBids(params['jobId']).subscribe(result => {
              this.bids = result;
              if (this.bids.length > 3) {
                this.recentBids = this.bids.slice(0, 3);
              } else {
                this.recentBids = this.bids;
              }
            });
          }
        });
      } else if (params['slug']) {
        this.jobSub = this.publicJobsService.getPublicJobsByUrl(params['slug']).subscribe(publicJob => {
          console.log(publicJob === null);
          if (publicJob === null) {
            this.jobExists = false;
            this.canSee = false;
            this.loading = false;
          } else {
            this.job = publicJob as Job;
            this.initJob(this.job);
            this.bidsSub = this.publicJobsService.getPublicJobBids(publicJob.id).subscribe(result => {
              this.bids = result;
              if (this.bids.length > 3) {
                this.recentBids = this.bids.slice(0, 3);
              } else {
                this.recentBids = this.bids;
              }
            });
          }
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.bidsSub) {
      this.bidsSub.unsubscribe();
    }
    this.jobSub.unsubscribe();
    this.authSub.unsubscribe();
  }

  async setClient(clientId) {
    this.jobPoster = await this.userService.getUser(clientId);
  }

  async initJob(job: Job) {
    this.jobExists = true;
    if (this.currentUser) {
      this.myJob = (job.clientId === this.currentUser.address);
      if (this.currentUser.type === 'Provider') {
        const check = await this.publicJobsService.canBid(this.currentUser.address, this.job);
        this.canBid = check;
      }
    } else {
      this.myJob = false;
    }
    if (job.draft && !this.myJob) {
      // only allow the job creator to see jobs in draft state
      this.canSee = false;
    } else {
      this.canSee = true;
    }
    this.setClient(this.job.clientId);
    this.setAttachmentUrl();
  }

  get isOpen() {
    return (this.job.state === JobState.acceptingOffers);
  }

  async submitBid() {
    this.isBidding = true;
    const providerInfo = {
      name: this.currentUser.name,
      skillTags: this.currentUser.skillTags,
      title: this.currentUser.title,
      timezone: this.currentUser.timezone,
      avatar: this.currentUser.avatar
    };
    const bidToSubmit = new Bid(this.currentUser.address, providerInfo, this.bidForm.value.price, this.bidForm.value.message, moment().format('x'));
    this.sent = await this.publicJobsService.handlePublicBid(bidToSubmit, this.job);
    this.isBidding = false;
    this.canBid = false;
    this.loading = false;
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
    document.execCommand('copy');
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
        if (attachment[0].filePath != null) { // Assume that it's caused by the async issue
          let getUrl: Subscription;
          const filePath = attachment[0].filePath;
          const fileRef = this.storage.ref(filePath);
          getUrl = fileRef.getDownloadURL().subscribe(result => {
            this.job.information.attachments[0].url = result;
          });
        }
      }
    }
  }

  async getProviderData(id) {
    const provider = await this.userService.getUserByEthAddress(id);
    return provider;
  }

  toLocaleDateString(timestamp) {
    const date = new Date(parseInt(timestamp, 10));
    return date.toLocaleDateString();
  }

  toggleDescription() {
    this.hideDescription = !this.hideDescription;
  }

}
