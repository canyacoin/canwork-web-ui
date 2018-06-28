import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { Job, JobDescription, PaymentType, TimeRange, WorkType } from '../../core-classes/job';
import { Upload } from '../../core-classes/upload';
import { User } from '../../core-classes/user';
import { AuthService } from '../../core-services/auth.service';
import { JobService } from '../../core-services/job.service';
import { UploadService } from '../../core-services/upload.service';
import { UserService } from '../../core-services/user.service';

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

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private jobService: JobService,
    private uploadService: UploadService) {
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
      budget: ['', Validators.compose([Validators.required, Validators.min(10), Validators.max(10000000)])]
    });
  }

  ngOnInit() {
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
        clientId: this.recipientAddress,
        providerId: this.currentUser.address,
        information: new JobDescription({
          description: this.postForm.value.description,
          title: this.postForm.value.title,
          initialStage: this.postForm.value.initialStage,
          skills: tags,
          attachments: new Array<Upload>(),
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
