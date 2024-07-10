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
import { Job, PaymentType } from '@class/job'
import { ActionType, IJobAction } from '@class/job-action'
import { UserType } from '@class/user'
import { JobService } from '@service/job.service'
import { getUsdToCan } from '@util/currency-conversion'

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

  otherParty: string = ''
  action: IJobAction

  executing = false

  usdToAtomicCan: number
  form: UntypedFormGroup = this.formBuilder.group({}) // Initialize with an empty form group

  actionTypes = ActionType

  constructor(
    private formBuilder: UntypedFormBuilder,
    private jobService: JobService
  ) {}

  ngOnInit(): void {
    this.otherParty = this.job?.otherParty?.name || 'the other party'
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.visible && changes.visible.currentValue === true) {
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
      case ActionType.review:
        this.form = this.formBuilder.group({
          message: [
            '',
            Validators.compose([Validators.min(0), Validators.max(350)]),
          ],
          rating: [null, Validators.required],
        })
        break
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
          this.action.message = this.form.value.message
          this.action.rating = this.form.value.rating
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
}
