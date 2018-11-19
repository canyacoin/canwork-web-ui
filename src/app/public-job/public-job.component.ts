import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { take } from 'rxjs/operators';
import { User, UserType } from '@class/user';
import { PublicJobService } from '@service/public-job.service';
import { UserService } from '@service/user.service';
import { AuthService } from '@service/auth.service';
import { Job, Bid } from '@class/job';
import { AngularFireStorage } from 'angularfire2/storage';
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
  sent = false;
  canSee = false;
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
    private formBuilder: FormBuilder
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
    this.setClient(this.job.clientId);
    this.setAttachmentUrl();
    if (this.currentUser.type === 'Provider') {
      const check = await this.publicJobsService.canBid(this.currentUser.address, this.job);
      this.canBid = check;
    }
    this.bids = await this.publicJobsService.getBids(job.id);
    console.log(this.bids);
  }

  async submitBid() {
    this.isBidding = true;
    const bidToSubmit = new Bid();
    bidToSubmit.budget = this.bidForm.value.price;
    bidToSubmit.message = this.bidForm.value.message;
    bidToSubmit.providerId = this.currentUser.address;
    bidToSubmit.providerName = this.currentUser.name;
    bidToSubmit.providerAvatar = this.currentUser.avatar;
    bidToSubmit.timestamp = moment().format('x');
    console.log(bidToSubmit);
    this.sent = await this.publicJobsService.handlePublicBid(bidToSubmit, this.job);
    this.isBidding = false;
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

}
