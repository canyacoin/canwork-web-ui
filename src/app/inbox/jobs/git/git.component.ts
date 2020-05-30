import { Component, OnDestroy, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { BinanceService } from '@service/binance.service'
import {
  Job,
  JobDescription,
  PaymentType,
  TimeRange,
  WorkType,
  JobState,
} from '@class/job'
import { ActionType, IJobAction } from '@class/job-action'
import { Upload } from '@class/upload'
import { User, UserType } from '@class/user'
import '@extensions/string'
import { AuthService } from '@service/auth.service'
import { JobService } from '@service/job.service'
import { ToastrService } from 'ngx-toastr'
import { PublicJobService } from '@service/public-job.service'
import { UploadService } from '@service/upload.service'
import { UserService } from '@service/user.service'
import { GenerateGuid } from '@util/generate.uid'
import * as _ from 'lodash'
import { Subscription } from 'rxjs'
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-git',
  templateUrl: './git.component.html',
  styleUrls: ['./git.component.css'],
})
export class GitComponent implements OnInit, OnDestroy {
  shareableJobForm: FormGroup = null
  pageLoaded = false
  paymentType = PaymentType
  recipientAddress = ''
  recipient: User = null
  currentUser: User
  slug = ''
  authSub: Subscription
  routeSub: Subscription
  jobSub: Subscription
  currentDate = ''
  isShareable = false
  isSending = false
  isGitReady = false
  sent = false
  draft = false
  editing = false
  error = false
  postToProvider = false
  gitResult = ''

  jobToEdit: Job
  jobId: string

  currentUpload: Upload
  uploadedFile: Upload
  maxFileSizeBytes = 50000000 // 50mb
  fileTooBig = false
  uploadFailed = false
  deleteFailed = false

  usdToAtomicCan: number
  providerTypes = [
    {
      name: 'Content Creators',
      img: 'writer.svg',
      id: 'contentCreator',
    },
    {
      name: 'Software Developers',
      img: 'dev.svg',
      id: 'softwareDev',
    },
    {
      name: 'Designers & Creatives',
      img: 'creatives.svg',
      id: 'designer',
    },
    {
      name: 'Financial Experts',
      img: 'finance.svg',
      id: 'finance',
    },
    {
      name: 'Marketing & Seo',
      img: 'marketing.svg',
      id: 'marketing',
    },
    {
      name: 'Virtual Assistants',
      img: 'assistant.svg',
      id: 'virtualAssistant',
    },
  ]


  
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private jobService: JobService,
    private binanceService: BinanceService,
    private publicJobService: PublicJobService,
    private uploadService: UploadService,
    private toastr: ToastrService,
    private http: HttpClient,
  ) {

    this.shareableJobForm = formBuilder.group({
      url: [
        '',
        Validators.compose([Validators.required]),
      ],

    })
  }

  async ngOnInit() {
    this.editing =
      this.activatedRoute.snapshot.params['jobId'] &&
      this.activatedRoute.snapshot.params['jobId'] !== ''
    this.authSub = this.authService.currentUser$.subscribe((user: User) => {
      this.currentUser = user
      this.activatedRoute.params.take(1).subscribe(params => {
        if (
          params['address'] &&
          params['address'] !== this.currentUser.address
        ) {
          this.recipientAddress = params['address']
          this.loadUser(this.recipientAddress)
          this.isShareable = false
          this.postToProvider = true
        } else {
          this.isShareable = true
        }
      })
      if (!this.editing) {
        this.jobId = GenerateGuid()

         
        if (!this.postToProvider) this.pageLoaded = true
      } else {

      }
    })
    try {
      this.usdToAtomicCan = await this.binanceService.getUsdToAtomicCan()
    } catch (e) {
      this.usdToAtomicCan = null
    }
    this.currentDate = new Date().toISOString().split('T')[0]
    this.notifyAddAddressIfNecessary()
  }

  async notifyAddAddressIfNecessary() {
    const noAddress = await this.authService.isAuthenticatedAndNoAddress()
    const user = await this.authService.getCurrentUser()
    if (noAddress && user.type == 'User') {
      this.toastr.warning('Add Binance Chain Wallet to create jobs')
    }
  }
  
  ValidateCurrentDate(control: AbstractControl) {
    if (!control.value.length) return null; // this is validated from Validators.required
    
    let deadline = new Date(control.value);
    let today = new Date();
    today.setHours(0,0,0,0);
    if (deadline < today) return {pastDueDate: true};

    return null;
  }





  ngOnDestroy() {
    if (this.authSub) {
      this.authSub.unsubscribe()
    }
  }

  async loadUser(address: string) {
    this.recipient = await this.userService.getUser(address)
    this.pageLoaded = true
    /**
    this.userService.getUser(address).then((user: User) => {
      this.recipient = user;
    });
     */
  }


  onBlurMethod(name) {
    this.shareableJobForm.controls[name].markAsDirty();
    this.shareableJobForm.controls[name].updateValueAndValidity();
  }
  onFocusMethod(name) {
    this.shareableJobForm.controls[name].markAsPristine();
  }  


  gitApiInvoke(url) {
    let tokenLab = '-MJbj8GWkYjjVMnroBzn'; // todo move to config and get from backend

    this.isSending = true
    this.error = false
    this.gitResult = ''
    this.isGitReady = false
    let project = '';
    let issue = '';
    let repo = 'unknown';
    let reLab = /https:\/\/gitlab\.com\/(.*)\/-\/issues\/(\d*)/gmi;
    let reHub = /https:\/\/github\.com\/(.*)\/issues\/(\d*)/gmi;
    let splittedLab = reLab.exec(url);
    let splittedHub = reHub.exec(url);
    let apiPathGit = '';
    if (!!splittedLab) repo = 'lab';
    if (!!splittedHub) repo = 'hub';
    if (repo == 'lab') {
      project = encodeURIComponent(splittedLab[1]);
      issue = splittedLab[2];
      apiPathGit = `https://gitlab.com/api/v4/projects/${project}/issues/${issue}?access_token=${tokenLab}`;
    }
    if (repo == 'hub') {
      project = splittedHub[1];
      issue = splittedHub[2];
      apiPathGit = `https://api.github.com/repos/${project}/issues/${issue}`;
    }    
    if (repo == 'unknown') {
      this.isSending = false
      return;
    }


    this.http.get(apiPathGit).subscribe(resp => {
      this.gitResult = JSON.stringify(resp, null, 4);   
      this.isSending = false
      this.isGitReady = true
      
    });    
  }


  onPaste(event: ClipboardEvent) {
    let clipboardData = event.clipboardData;
    let pastedText = clipboardData.getData('text');
    this.gitApiInvoke(pastedText);
  }

  async submitGitUrl() {
    this.gitApiInvoke(this.shareableJobForm.value.url);

  }

  async updateJob() {
    // uploads the job
  }
}
