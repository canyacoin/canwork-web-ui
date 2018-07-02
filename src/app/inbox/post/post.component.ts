import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Http, Response } from '@angular/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireUploadTask } from 'angularfire2/storage';
import * as _ from 'lodash';
import { Subscription } from 'rxjs/Subscription';

import { Job, JobDescription, PaymentType, TimeRange, WorkType } from '../../core-classes/job';
import { Upload } from '../../core-classes/upload';
import { User } from '../../core-classes/user';
import { AuthService } from '../../core-services/auth.service';
import { JobService } from '../../core-services/job.service';
import { UploadCategory, UploadService } from '../../core-services/upload.service';
import { UserService } from '../../core-services/user.service';
import { getUsdToCan } from '../../core-utils/currency-conversion';
import { GenerateGuid } from '../../core-utils/generate.uid';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit, OnDestroy {

  postForm: FormGroup = null;
  pageLoaded = false;
  paymentType = PaymentType;

  recipientAddress = '';
  recipient: User = null;
  currentUser: User;

  authSub: Subscription;

  isSending = false;
  sent = false;

  jobId: string;

  currentUpload: Upload;
  uploadedFile: Upload;
  maxFileSizeBytes = 50000000; // 50mb
  fileTooBig = false;
  uploadFailed = false;
  deleteFailed = false;

  canToUsd: number;

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private jobService: JobService,
    private uploadService: UploadService,
    private http: Http) {
    this.postForm = formBuilder.group({
      description: ['', Validators.compose([Validators.required, Validators.maxLength(255)])],
      title: ['', Validators.compose([Validators.required, Validators.maxLength(64)])],
      initialStage: ['', Validators.compose([Validators.required, Validators.maxLength(64)])],
      skills: ['', Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(100)])],
      attachments: [''],
      workType: ['', Validators.compose([Validators.required])],
      timelineExpectation: ['', Validators.compose([Validators.required])],
      weeklyCommitment: ['', Validators.compose([Validators.required, Validators.min(1), Validators.max(60)])],
      paymentType: ['', Validators.compose([Validators.required])],
      budget: ['', Validators.compose([Validators.required, Validators.min(1), Validators.max(10000000)])]
    });
  }

  async ngOnInit() {
    this.jobId = GenerateGuid();
    this.authSub = this.authService.currentUser$.subscribe((user: User) => {
      this.currentUser = user;
      this.activatedRoute.params.take(1).subscribe((params) => {
        if (params['address'] && params['address'] !== this.currentUser.address) {
          this.recipientAddress = params['address'];
          this.loadUser(this.recipientAddress);
        } else {
          this.pageLoaded = true;
        }
      });
    });
    const canToUsdResp = await this.http.get('https://api.coinmarketcap.com/v2/ticker/2343/?convert=USD').toPromise();
    if (canToUsdResp.ok) {
      this.canToUsd = JSON.parse(canToUsdResp.text())['data']['quotes']['USD']['price'];
    }
  }

  usdToCan(usd: number) {
    return getUsdToCan(this.canToUsd, usd);
  }


  detectFiles(event) {
    const file = event.target.files.item(0);
    this.uploadSingle(file);
  }

  async uploadSingle(file: File) {
    this.currentUpload = null;
    this.uploadFailed = false;
    this.fileTooBig = false;
    if (file.size > this.maxFileSizeBytes) {
      this.fileTooBig = true;
    } else {
      try {
        this.currentUpload = new Upload(this.currentUser.address, file.name, file.size);
        const upload: Upload = await this.uploadService.uploadJobAttachmentToStorage(this.jobId, this.currentUpload, file);
        if (upload) {
          this.uploadedFile = upload;
        } else {
          this.uploadFailed = true;
          this.currentUpload = null;
        }
      } catch (e) {
        this.uploadFailed = true;
        this.currentUpload = null;
      }
    }
  }

  async removeUpload(upload: Upload) {
    this.deleteFailed = false;
    const deleted = await this.uploadService.cancelJobAttachmentUpload(this.jobId, upload);
    if (deleted) {
      this.uploadedFile = null;
      this.currentUpload = null;
    } else {
      this.deleteFailed = true;
    }
  }

  humanFileSize(bytes, si) {
    const thresh = si ? 1000 : 1024;
    if (Math.abs(bytes) < thresh) {
      return bytes + ' B';
    }
    const units = si
      ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
      : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    do {
      bytes /= thresh;
      ++u;
    } while (Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1) + ' ' + units[u];
  }

  ngOnDestroy() {
    if (this.authSub) { this.authSub.unsubscribe(); }
  }

  loadUser(address: string) {
    this.userService.getUser(address).then((user: User) => {
      this.recipient = user;
      this.pageLoaded = true;
    });
  }

  skillTagsUpdated(value: string) {
    this.postForm.controls['skills'].setValue(value);
  }

  workTypes(): Array<string> {
    return Object.values(WorkType);
  }
  setWorkType(type: WorkType) {
    this.postForm.controls.workType.setValue(type);
  }

  timeRanges(): Array<string> {
    return Object.values(TimeRange);
  }
  setTimeRange(range: TimeRange) {
    this.postForm.controls.timelineExpectation.setValue(range);
  }

  paymentTypes(): Array<string> {
    return Object.values(PaymentType);
  }
  setPaymentType(type: PaymentType) {
    this.postForm.controls.paymentType.setValue(type);
  }

  async submitForm() {
    this.isSending = true;

    let tags: string[] = this.postForm.value.skills === '' ? [] : this.postForm.value.skills.split(',').map(item => item.trim());
    if (tags.length > 6) {
      tags = tags.slice(0, 6);
    }

    try {
      const job = new Job({
        id: this.jobId,
        clientId: this.recipientAddress,
        providerId: this.currentUser.address,
        information: new JobDescription({
          description: this.postForm.value.description,
          title: this.postForm.value.title,
          initialStage: this.postForm.value.initialStage,
          skills: tags,
          attachments: [this.uploadedFile],
          workType: this.postForm.value.workType,
          timelineExpectation: this.postForm.value.timelineExpectation,
          weeklyCommitment: this.postForm.value.weeklyCommitment
        }),
        paymentType: this.postForm.value.paymentType,
        budget: this.postForm.value.budget
      });

      this.sent = await this.jobService.postJob(job);
      this.isSending = false;
    } catch (e) {
      this.sent = false;
      this.isSending = false;
    }


    // const channelId = await this.chatService.createChannelsAsync(this.currentUser, this.recipient);
    // if (channelId) {
    // this.chatService.sendNewPostMessages(channelId, this.currentUser, this.recipient, this.postForm.value.description, this.postForm.value.budget);
  }
}
