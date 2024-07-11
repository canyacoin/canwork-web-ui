import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  OnInit,
} from '@angular/core'
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms'
import { Job, PaymentType, JobState, Bid } from '@class/job'
import { ActionType, IJobAction } from '@class/job-action'
import { User, UserType } from '@class/user'
import { JobService } from '@service/job.service'
import { getUsdToCan } from '@util/currency-conversion'
import { BscService } from '@service/bsc.service'
import { Router } from '@angular/router'
import { MessageService } from 'primeng/api'
import { UserService } from '@service/user.service'

@Component({
  selector: 'action-dialog',
  templateUrl: './action-dialog.component.html',
})
export class ActionDialogComponent implements OnInit, OnChanges {
  // two way data binding
  private _visible: boolean
  @Input()
  get visible(): boolean {
    return this._visible
  }
  set visible(value: boolean) {
    this._visible = value
    this.visibleChange.emit(this._visible)
  }
  @Output() visibleChange = new EventEmitter<boolean>()

  @Input() job: Job
  @Input() userType: UserType

  @Input() actionType: ActionType
  @Input() selectedBid: Bid

  otherParty: string = 'the other party'
  action: IJobAction

  executing = false

  usdToAtomicCan: number
  form: UntypedFormGroup = this.formBuilder.group({}) // Initialize with an empty form group

  actionTypes = ActionType
  isReleasing = false

  numberOfStars = 0
  commentText = ''
  jobPoster: User = null

  constructor(
    private formBuilder: UntypedFormBuilder,
    private jobService: JobService,
    private bscService: BscService,
    private router: Router,
    private messageService: MessageService,
    private userService: UserService
  ) {}

  async ngOnInit() {
    console.log('=================>', this.job)
    if (this.job)
      this.otherParty = this.job?.otherParty?.name || 'the other party'
    if (this.job) {
      await this.setClient(this.job.clientId)
    }
  }

  async setClient(clientId: string) {
    /*
    new one, retrieve user only once (if not already retrieved)
    and use the new fastest Algolia getUserById service version
    */
    console.log('this.jobPoster', this.jobPoster)

    if (!this.jobPoster) {
      this.jobPoster = await this.userService.getUser(clientId)
      console.log('this.jobPoster', this.jobPoster)

      if (this.jobPoster) {
        let avatar = this.jobPoster.avatar // current, retrocomp
        //console.log(result[i])
        if (
          this.jobPoster.compressedAvatarUrl &&
          this.jobPoster.compressedAvatarUrl != 'new'
        ) {
          // keep same object structure
          // use compress thumbed if exist and not a massive update (new)
          avatar = {
            uri: this.jobPoster.compressedAvatarUrl,
          }
        }
        this.jobPoster.avatarUri = avatar.uri
      }
    }
  }

  setStars(value: number) {
    this.numberOfStars = value
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.visible && this.visible === true) {
      this.numberOfStars = 0
      this.commentText = ''
      this.initializeForm()
    }
  }

  initializeForm() {
    switch (this.actionType) {
      case ActionType.counterOffer:
        this.action.paymentType = this.job.paymentType
        this.form =
          this.userType === UserType.provider
            ? this.formBuilder.group({
                budget: [
                  this.job.budget,
                  Validators.compose([
                    Validators.required,
                    Validators.min(1),
                    Validators.max(10000000),
                  ]),
                ],
                terms: [false, Validators.requiredTrue],
              })
            : this.formBuilder.group({
                budget: [
                  this.job.budget,
                  Validators.compose([
                    Validators.required,
                    Validators.min(1),
                    Validators.max(10000000),
                  ]),
                ],
              })
        break
      case ActionType.addMessage:
        this.form = this.formBuilder.group({
          // Add form initialization for this action type
          message: ['', Validators.required],
        })
        console.log('this.form===================>', this.form)
        break
      case ActionType.dispute:
        // this.form = this.formBuilder.group({
        //   message: ['', Validators.required],
        // })
        break
      // case ActionType.review:
      //   this.form = this.formBuilder.group({
      //     message: [
      //       '',
      //       Validators.compose([Validators.min(0), Validators.max(350)]),
      //     ],
      //     rating: [null, Validators.required],
      //   })
      //   break
      case ActionType.acceptTerms:
        this.form = this.formBuilder.group({
          terms: [false, Validators.requiredTrue],
        })
        break
      default:
        break
    }
  }

  async handleAction(event: Event) {
    event.preventDefault()
    this.action = new IJobAction(this.actionType, this.userType)
    console.log(
      '++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++'
    )
    console.log('this.action: ', this.action)
    console.log('this.action.message: ', this.action.message)
    this.executing = true
    try {
      switch (this.actionType) {
        case ActionType.counterOffer:
          this.job.budget = this.form.value.budget
          this.action.setPaymentProperties(
            this.job.budget,
            this.job.information.timelineExpectation,
            this.job.information.workType,
            this.job.information.weeklyCommitment,
            this.job.paymentType
          )
          break
        case ActionType.review:
          // this.action.message = this.form.value.message
          // this.action.rating = this.form.value.rating
          this.action.message = this.commentText
          this.action.rating = this.numberOfStars
          break
        case ActionType.addMessage:
          this.action.message = this.form.value.message
          break
        case ActionType.dispute:
          break
        case ActionType.acceptTerms:
        case ActionType.declineTerms:
        case ActionType.enterEscrow:
        default:
          break
      }
      const success = await this.jobService.handleJobAction(
        this.job,
        this.action
      )
      if (success) {
        this.executing = false
        this.visible = false
      } else {
        this.executing = false
      }
    } catch (e) {
      this.executing = false
      console.log(e)
      console.log('error')
      if (e == 'connect') this.visible = false // close dialog to permit connect
    }
  }

  get submitDisabled(): boolean {
    if (!this.form) {
      return false
    }
    return this.form.invalid
  }

  handleCancelClick(event: Event): void {
    event.preventDefault()
    this.visible = false
  }

  // usdToCan(usd: number) {
  //   return getUsdToCan(this.usdToAtomicCan, usd)
  // }

  async releaseBtnClick(event: Event) {
    event.preventDefault()
    if (this.job.bscEscrow === true) {
      console.log('ActionType.acceptFinish BEP20')
      this.isReleasing = true
      await this.releaseEscrowBsc()
      this.visible = false
    }
  }

  private async releaseEscrowBsc() {
    console.log('release Escrow BSC')
    // we check if bsc chain is connected and if not, suggest to connect to bsc chain explicitely (for now only metamask, not bep2 chain
    if (!(await this.bscService.isBscConnected())) {
      const routerStateSnapshot = this.router.routerState.snapshot
      this.messageService.add({
        severity: 'warn',
        summary: 'Warn',
        detail: `Connect your BNBChain wallet to release the payment`,
      })

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

  get isClient(): boolean {
    return this.userType === UserType.client
  }
}
