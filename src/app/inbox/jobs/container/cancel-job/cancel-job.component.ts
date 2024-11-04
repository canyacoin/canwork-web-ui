import { Component, OnInit, Directive } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Job } from '@class/job'
import { JobService } from '@service/job.service'
import 'rxjs/add/operator/take'

@Component({
  selector: 'app-cancel-job',
  templateUrl: './cancel-job.component.html',
  styleUrls: ['./cancel-job.component.css'],
})
export class CancelJobComponent implements OnInit {
  job: Job
  canPayOptions

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
      complete: onComplete,
      cancel: onCancel,
    }
  }
}
