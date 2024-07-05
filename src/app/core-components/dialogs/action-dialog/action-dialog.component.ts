import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core'
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms'
import { Job, PaymentType } from '@class/job'
import { ActionType, IJobAction } from '@class/job-action'
import { UserType } from '@class/user'
import { JobService } from '@service/job.service'

@Component({
  selector: 'action-dialog',
  templateUrl: './action-dialog.component.html',
})
export class ActionDialogComponent implements OnInit {
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

  @Input() otherParty: string
  @Input() actionType: ActionType

  action: IJobAction

  executing = false

  actionTypes = ActionType
  paymentTypes = PaymentType

  usdToAtomicCan: number
  form: UntypedFormGroup = null

  constructor(
    private formBuilder: UntypedFormBuilder,
    private jobService: JobService
  ) {}

  ngOnInit() {
    console.log('action-dialog: ')
    console.log('job ', this.job)
    console.log('userType ', this.job)
    console.log('otherParty ', this.otherParty)
    console.log('actionType ', this.actionType)
    this.action = new IJobAction(this.actionType, this.userType)
    console.log(this.action)
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
      case ActionType.dispute:
        this.form = this.formBuilder.group({
          message: ['', Validators.required],
        })
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

  async handleAction() {
    console.log('handleAction: ' + this.actionType)
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
        case ActionType.dispute:
          this.action.message = this.form.value.message
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
