import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { CanPay, Operation } from '@canpay-lib/lib'
import { Job } from '@class/job'
import { JobService } from '@service/job.service'
import 'rxjs/add/operator/take'

import { environment } from '../../../../../environments/environment'
@Component({
  selector: 'app-cancel-job',
  templateUrl: './cancel-job.component.html',
  styleUrls: ['./cancel-job.component.css'],
})
export class CancelJobComponent implements OnInit {
  job: Job

  canPayOptions: CanPay

  constructor(
    private jobService: JobService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const jobId = this.activatedRoute.parent.snapshot.params['id'] || null
    if (jobId) {
      this.jobService
        .getJob(jobId)
        .take(1)
        .subscribe(async (job: Job) => {
          this.job = job
          console.log(job)
          this.startCanpay()
        })
    }
  }

  async startCanpay() {
    const initiateCancellation = async () => {
      console.log('initiating cancellation')
      // TODO remove
      // const canWorkContract = new CanWorkJobContract(this.ethService)
      // console.log(canWorkContract)
      // canWorkContract
      //   .connect()
      //   .cancelJobByProvider(
      //     this.job,
      //     this.ethService.getOwnerAccount(),
      //     onTxHash
      //   )
      //   .then(setProcessResult.bind(this.canPayOptions))
      //   .catch(setProcessResult.bind(this.canPayOptions))
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
      successText:
        'Great, the job has been cancelled and the funds returned to the client!',
      operation: Operation.interact,
      complete: onComplete,
      cancel: onCancel,
      postAuthorisationProcessName: 'Job Cancellation',
      startPostAuthorisationProcess: initiateCancellation.bind(this),
      postAuthorisationProcessResults: null,
    }
  }
}
