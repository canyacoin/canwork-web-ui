import { Component, OnInit, Directive } from '@angular/core'
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms'
import { Job, PaymentType } from '@class/job'
import { ActionType, IJobAction } from '@class/job-action'
import { User, UserType } from '@class/user'
import { JobService } from '@service/job.service'
import { getUsdToCan } from '@util/currency-conversion'
import { RatingChangeEvent } from 'angular-star-rating'

//import { SimpleModalComponent } from 'ngx-simple-modal' // old
import { NgxModalComponent } from 'ngx-modalview'

//import { DialogComponent, DialogService } from 'ng2-bootstrap-modal'

export class ActionDialogOptions {
  job: Job
  actionType: ActionType
  userType: UserType
  otherParty: string

  constructor(init?: Partial<ActionDialogOptions>) {
    Object.assign(this, init)
  }
}

@Component({
  selector: 'app-action-dialog',
  templateUrl: './action-dialog.component.html',
  styleUrls: ['./action-dialog.component.css'],
})
export class ActionDialogComponent
  extends NgxModalComponent<ActionDialogOptions, boolean>
  implements ActionDialogOptions, OnInit
{
  actionType: ActionType
  userType: UserType

  job: Job
  action: IJobAction

  currentUser: User
  otherParty: string

  executing = false

  actionTypes = ActionType
  paymentTypes = PaymentType

  usdToAtomicCan: number
  form: UntypedFormGroup = null

  constructor(
    private formBuilder: UntypedFormBuilder,
    private jobService: JobService
  ) {
    super()
  }

  ngOnInit() {
    console.log('action-dialog: ')
    this.action = new IJobAction(this.actionType, this.userType)
    console.log(this.actionType)
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

  /** Helper method to get the colour associated with each action button */
  getColour(type: ActionType): string {
    switch (type) {
      case ActionType.cancelJob:
      case ActionType.dispute:
        return 'danger'
      case ActionType.declineTerms:
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

  onRatingChange($event: RatingChangeEvent) {
    //console.log('onRatingUpdated $event: ', $event)
    this.form.controls['rating'].setValue($event.rating)
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
        this.result = true
        this.executing = false
        this.close()
      } else {
        this.executing = false
      }
    } catch (e) {
      this.executing = false
      console.log(e)
      console.log('error')
      if (e == 'connect') this.close() // close dialog to permit connect
    }
  }

  get submitDisabled(): boolean {
    if (!this.form) {
      return false
    }
    return this.form.invalid
  }

  usdToCan(usd: number) {
    return getUsdToCan(this.usdToAtomicCan, usd)
  }
}
