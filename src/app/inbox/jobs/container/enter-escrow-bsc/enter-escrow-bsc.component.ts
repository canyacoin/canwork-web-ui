import { Component, OnInit, AfterViewInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { CanPay, bepAssetData } from '@canpay-lib/lib'
import { Job, JobState } from '@class/job'
import { ActionType, IJobAction } from '@class/job-action'
import { UserType } from '@class/user'
import { ToastrService } from 'ngx-toastr'
import 'rxjs/add/operator/take'
import { Observable } from 'rxjs/Observable'
import { HttpClient } from '@angular/common/http'

import { JobService } from '@service/job.service'
import { UserService } from '@service/user.service'
import { BscService } from '@service/bsc.service'

@Component({
  selector: 'app-enter-escrow-bsc',
  templateUrl: './enter-escrow-bsc.component.html',
  styleUrls: ['./enter-escrow-bsc.component.css']
})
export class EnterEscrowBscComponent implements OnInit, AfterViewInit {
  loading = true
  jobStateCheck = false
  walletConnected = false
  showBscAssetSelection = false
  jobBudgetUsd: number
  job: Job
  chain: string
  

  constructor(
    private jobService: JobService,
    private userService: UserService,
    private bscService: BscService,
    private toastr: ToastrService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private http: HttpClient  
  ) { }

  ngOnInit() {
    const jobId = this.activatedRoute.parent.snapshot.params['id'] || null
    if (jobId) {
      console.log('Job ID: ' + jobId)
      this.jobService
        .getJob(jobId)
        .take(1)
        .subscribe(async (job: Job) => {
          this.jobBudgetUsd = await this.jobService.getJobBudgetUsd(job)
          this.job = job
          if (this.job.state !== JobState.termsAcceptedAwaitingEscrow) {
            this.jobStateCheck = false
          } else {
            this.jobStateCheck = true
          }

          this.loading = false
          const chain = await this.checkWalletConnection()
          if (chain == 'BEP20') this.startBscAssetSelector();
        })
    }    
  }
  
  startBscAssetSelector() {
    if (this.jobStateCheck && this.walletConnected) {
      this.showBscAssetSelection = true
    }
    
  }

  async checkWalletConnection() {
    let connectedChain = '';
    // BEP20 has the priority, if it's connected will use it
    if (this.bscService.isMetamaskConnected()) connectedChain = 'BEP20';      
    if (!connectedChain) {
      const routerStateSnapshot = this.router.routerState.snapshot
      this.toastr.warning(
        'Connect your wallet to use this payment method',
        '',
        { timeOut: 2000 }
      )
      this.router.navigate(['/wallet-bnb'], {
        queryParams: { returnUrl: routerStateSnapshot.url },
      })
      return
    }
    this.walletConnected = true
    this.chain = connectedChain
    const address = this.bscService.getAddress() // temporary
    console.log('Connected to BEP20 wallet: ' + address) // temporary
    return connectedChain
  }

  ngAfterViewInit() {

  }
  

}
