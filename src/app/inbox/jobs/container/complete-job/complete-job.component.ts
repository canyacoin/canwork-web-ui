import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { CanPay, Operation } from '@canpay-lib/lib'
import { Job, JobState } from '@class/job'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { JobService } from '@service/job.service'
import 'rxjs/add/operator/take'
import { environment } from '../../../../../environments/environment'

@Component({
  selector: 'app-complete-job',
  templateUrl: './complete-job.component.html',
  styleUrls: ['./complete-job.component.css'],
})
export class CompleteJobComponent implements OnInit {
  job: Job
  canPayOptions: CanPay
  errorMsg: any
  fiatPayment: boolean
  canSee: boolean
  processing = false
  complete = false
  processed = false
  wrongPassword = false
  success = false
  constructor(
    private jobService: JobService,
    private activatedRoute: ActivatedRoute,
    private router: Router,

    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    const jobId = this.activatedRoute.parent.snapshot.params['id'] || null
    if (jobId) {
      this.jobService
        .getJob(jobId)
        .take(1)
        .subscribe(async (job: Job) => {
          this.job = job
          if (this.job.state !== JobState.workPendingCompletion) {
            this.canSee = false
          } else {
            this.canSee = true
            if (
              this.job.fiatPayment === undefined ||
              this.job.fiatPayment === false
            ) {
              this.fiatPayment = false
              this.startCanpay()
            } else {
              this.fiatPayment = true
            }
          }
        })
    }
  }

  async startCanpay() {
    const initiateCompleteJob = async () => {
      console.log('initializeCompleteJob')
    }

    const onComplete = async () => {
      // call endpoint?
      this.router.navigate(['/inbox/job', this.job.id])
    }

    const onCancel = () => {
      // call endpoint?
      this.router.navigate(['/inbox/job', this.job.id])
    }

    this.canPayOptions = {
      successText: 'Woohoo, job complete!',
      operation: Operation.interact,
      complete: onComplete,
      cancel: onCancel,
      postAuthorisationProcessName: 'Job completion',
      startPostAuthorisationProcess: initiateCompleteJob.bind(this),
      postAuthorisationProcessResults: null,
    }
  }
}
