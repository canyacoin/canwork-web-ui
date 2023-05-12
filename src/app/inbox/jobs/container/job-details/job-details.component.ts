import { Component, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Job, JobState } from '@class/job'
import { ActionType, IJobAction } from '@class/job-action'
import { Review } from '@class/review'
import { User, UserType } from '@class/user'
import { AuthService } from '@service/auth.service'
import { JobService } from '@service/job.service'
import { MobileService } from '@service/mobile.service'
import { ReviewService } from '@service/review.service'
import { Transaction, TransactionService } from '@service/transaction.service'
import { BscService, BepChain } from '@service/bsc.service'
import { ToastrService } from 'ngx-toastr'
import { AngularFireStorage } from 'angularfire2/storage'
import { DialogService } from 'ng2-bootstrap-modal'
import { Subscription } from 'rxjs'
import { take } from 'rxjs/operators'

import { environment } from '../../../../../environments/environment'
import {
  ActionDialogComponent,
  ActionDialogOptions,
} from '../action-dialog/action-dialog.component'

@Component({
  selector: 'app-job-details',
  templateUrl: './job-details.component.html',
  styleUrls: ['./job-details.component.scss'],
})
export class JobDetailsComponent implements OnInit, OnDestroy {
  jobState = JobState

  currentUser: User
  // The current user is 'acting' as this type
  // This allows providers to work as both client and provider
  currentUserType: UserType
  job: Job
  transactions: Transaction[] = []
  reviews: Review[] = new Array<Review>()
  isOnMobile = false
  isPartOfJob = false
  jobSub: Subscription
  transactionsSub: Subscription
  reviewsSub: Subscription
  hideDescription = true
  isInitialised = false
  isReleasing = false

  constructor(
    private authService: AuthService,
    private jobService: JobService,
    private bscService: BscService,
    private toastr: ToastrService,
    private transactionService: TransactionService,
    private reviewService: ReviewService,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private storage: AngularFireStorage,
    private mobile: MobileService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.pipe(take(1)).subscribe((user: User) => {
      this.currentUser = user
      this.initialiseJob()
    })
    this.isOnMobile = this.mobile.isOnMobile
  }

  ngOnDestroy() {
    if (this.jobSub) {
      this.jobSub.unsubscribe()
    }
    if (this.transactionsSub) {
      this.transactionsSub.unsubscribe()
    }
  }

  initialiseJob() {
    const jobId = this.activatedRoute.snapshot.params['id'] || null
    if (jobId) {
      this.jobSub = this.jobService.getJob(jobId).subscribe((job: Job) => {
        this.isPartOfJob =
          this.currentUser.address === job.clientId ||
          this.currentUser.address === job.providerId
        if (this.isPartOfJob) {
          this.job = new Job(job)
          this.transactionTypeService(jobId)
          this.currentUserType =
            this.currentUser.address === job.clientId
              ? UserType.client
              : UserType.provider
          this.jobService.assignOtherPartyAsync(this.job, this.currentUserType)
          this.setAttachmentUrl()
          if (!this.isInitialised) {
            this.jobService.updateJobState(this.job)
            this.isInitialised = true
          }
        } else {
          console.log('Thou never belong hither , aroint thee!')
          this.router.navigateByUrl('/not-found')
        }
      })

      this.reviewsSub = this.reviewService
        .getJobReviews(jobId)
        .subscribe((reviews: Review[]) => {
          this.reviews = reviews
        })
    }
  }

  private transactionTypeService(jobId): any {
    this.transactionsSub = this.transactionService
      .getTransactionsByJob(jobId)
      .subscribe((transactions: Transaction[]) => {
        this.transactions = transactions
      })
  }
  actionIsDisabled(action: ActionType): boolean {
    switch (action) {
      case ActionType.cancelJobEarly:
        return !(this.job.bscEscrow === true) // enable only if it's a bsc job, we implemented only for it
      case ActionType.review:
        return !this.userCanReview
      default:
        return false
    }
  }

  actionIsHidden(action: ActionType): boolean {
    switch (action) {
      case ActionType.review:
        return !this.userCanReview
      default:
        return false
    }
  }

  get jobIsComplete(): boolean {
    return this.job.state === JobState.complete
  }

  get userCanReview(): boolean {
    return (
      this.reviews &&
      this.reviews.findIndex(x => x.reviewerId === this.currentUser.address) ===
        -1
    )
  }

  get hasPendingTransactions(): boolean {
    if (this.transactions) {
      return this.transactions.findIndex(x => !x.failure && !x.success) > -1
    }
    return false
  }

  get availableActions(): ActionType[] {
    return this.jobService.getAvailableActions(
      this.job.state,
      this.currentUserIsClient
    )
  }

  /** Helper method to get the colour associated with each action button */
  getColour(type: ActionType): string {
    switch (type) {
      case ActionType.cancelJob:
      case ActionType.dispute:
      case ActionType.declineTerms:
      case ActionType.cancelJobEarly:
        return 'danger'
      case ActionType.counterOffer:
      case ActionType.addMessage:
        return 'info'
      case ActionType.acceptTerms:
      case ActionType.enterEscrow:
      case ActionType.finishedJob:
      case ActionType.acceptFinish:
        return 'success'
      default:
        return 'info'
    }
  }

  get currentUserIsClient() {
    return this.currentUserType === UserType.client
  }

  private async setAttachmentUrl() {
    const attachment = this.job.information.attachments
    if (attachment.length > 0) {
      // check if there's any attachment on this job
      if (attachment[0].url === null || attachment[0].url === undefined) {
        // [0] is used here since we only support single file upload anyway.
        console.log('no URL')
        if (attachment[0].filePath != null) {
          // Assume that it's caused by the async issue
          let getUrl: Subscription
          const filePath = attachment[0].filePath
          const fileRef = this.storage.ref(filePath)
          getUrl = fileRef.getDownloadURL().subscribe(result => {
            this.job.information.attachments[0].url = result
          })
          console.log(attachment)
        }
      } else {
        console.log('Has URL')
        console.log(attachment[0].url)
      }
    }
  }

  private async releaseEscrowBsc() {
    console.log('release Escrow BSC')
    // we check if bsc chain is connected and if not, suggest to connect to bsc chain explicitely (for now only metamask, not bep2 chain
    if (!(await this.bscService.isBscConnected())) {
      const routerStateSnapshot = this.router.routerState.snapshot
      this.toastr.warning(
        'Connect your BNBChain wallet to release the payment',
        '',
        {
          timeOut: 4000,
        }
      )
      this.router.navigate(['/wallet-bnb'], {
        queryParams: { returnUrl: routerStateSnapshot.url },
      })
      return
    }

    // we are bsc connected, go on
    const jobId = this.job.id
    console.log('releasing jobId ' + jobId)
    let result = await this.bscService.release(jobId)
    if (!result.err) {
      // save tx immediately
      this.isReleasing = false

      // moved to backend
      /*
      let tx = await this.transactionService.createTransaction(
        `Release funds`,
        result.transactionHash,
        jobId
      )*/

      const action = new IJobAction(ActionType.acceptFinish, UserType.client)
      this.job.state = JobState.complete
      await this.jobService.handleJobAction(this.job, action)
    }
  }

  async executeAction(action: ActionType) {
    console.log('executeAction: ' + action)
    switch (action) {
      case ActionType.enterEscrow:
        this.toastr.warning(
          'Escrow payments halted while we upgrade the system.  Please check back soon',
          '',
          {
            timeOut: 5000,
          }
        )
        /*const chain = await this.checkConnectionAndDetectChain()
        if (chain === BepChain.Binance)
          this.router.navigate(['../enter-escrow'], {
            relativeTo: this.activatedRoute,
          })
        else if (chain === BepChain.SmartChain)
          this.router.navigate(['../enter-bsc-escrow'], {
            relativeTo: this.activatedRoute,
          })*/

        break
      case ActionType.acceptFinish:
        this.isReleasing = true
        console.log('bscEscrow = ', this.job.bscEscrow)
        if (this.job.bscEscrow === true) {
          console.log('ActionType.acceptFinish BEP20')
          await this.releaseEscrowBsc()
        }
        break
      case ActionType.cancelJobEarly:
        console.log('ActionType.cancelJobEarly')
        this.dialogService
          .addDialog(
            ActionDialogComponent,
            new ActionDialogOptions({
              job: this.job,
              userType: this.currentUserType,
              actionType: action,
            })
          )
          .subscribe(success => {
            if (!success) {
              console.log('Action cancelled')
            }
          })
        break
      case ActionType.dispute:
        console.log('ActionType.dispute')
        this.dialogService
          .addDialog(
            ActionDialogComponent,
            new ActionDialogOptions({
              job: this.job,
              userType: this.currentUserType,
              otherParty: this.job['otherParty']['name'] || 'the other party',
              actionType: action,
            })
          )
          .subscribe(success => {
            if (!success) {
              console.log('Action cancelled')
            }
          })
        break
      default:
        console.log('default')
        this.dialogService
          .addDialog(
            ActionDialogComponent,
            new ActionDialogOptions({
              job: this.job,
              userType: this.currentUserType,
              otherParty: this.job['otherParty']['name'] || 'the other party',
              actionType: action,
            })
          )
          .subscribe(success => {
            if (!success) {
              console.log('Action cancelled')
            }
          })
        break
    }
  }

  getActionExecutor(action: IJobAction) {
    return action.executedBy === this.currentUserType
      ? 'You'
      : this.job['otherParty']
      ? this.job['otherParty'].name
      : ''
  }

  getTxLink(txHash: string) {
    return `${environment.bsc.blockExplorerUrls[0]}/tx/${txHash}`
  }

  getTxColor(tx: Transaction) {
    return 'success' // default
    /* 
    todo: there are failure scenarios that we should handle?
    if so we have to handle into bsc service and handle tx timeout, cause receipt will not arrive
    */
    // return tx.success ? 'success' : tx.failure ? 'danger' : 'warning' // obsolete
  }

  toggleDescription() {
    this.hideDescription = !this.hideDescription
  }

  async checkConnectionAndDetectChain(): Promise<string> {
    let connectedChain = ''

    // BEP20 has the priority, if it's connected will use it
    if (await this.bscService.isBscConnected())
      connectedChain = BepChain.SmartChain
    if (!connectedChain) {
      const routerStateSnapshot = this.router.routerState.snapshot
      this.toastr.warning('Please connect your wallet before going on', '', {
        timeOut: 2000,
      })
      this.router.navigate(['/wallet-bnb'], {
        queryParams: { returnUrl: routerStateSnapshot.url },
      })
      return null
    }
    return connectedChain
  }
}
