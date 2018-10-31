import { AfterViewInit, Component, ComponentRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Http, Response } from '@angular/http';
import { Job, PaymentType } from '@class/job';
import { ActionType, IJobAction } from '@class/job-action';
import { User, UserType } from '@class/user';
import { JobService } from '@service/job.service';
import { UserService } from '@service/user.service';
import { getUsdToCan } from '@util/currency-conversion';
import { DialogComponent, DialogService } from 'ng2-bootstrap-modal';

export class ActionDialogOptions {
  job: Job;
  actionType: ActionType;
  userType: UserType;

  constructor(init?: Partial<ActionDialogOptions>) {
    Object.assign(this, init);
  }
}

@Component({
  selector: 'app-action-dialog',
  templateUrl: './action-dialog.component.html',
  styleUrls: ['./action-dialog.component.css']
})
export class ActionDialogComponent extends DialogComponent<ActionDialogOptions, boolean> implements ActionDialogOptions, OnInit {

  actionType: ActionType;
  userType: UserType;

  job: Job;
  action: IJobAction;

  currentUser: User

  executing = false;

  actionTypes = ActionType;
  paymentTypes = PaymentType;

  canToUsd: number;
  form: FormGroup = null;

  constructor(
    dialogService: DialogService,
    private formBuilder: FormBuilder,
    private jobService: JobService,
    private userService: UserService,
    private http: Http) {
    super(dialogService);
  }

  async handleAction() {
    this.executing = true;
    try {
      let action
      switch (this.actionType) {
        case ActionType.counterOffer:
          this.job.budget = this.form.value.budget
          action = new IJobAction(ActionType.counterOffer, this.userType)
          action.setPaymentProperties(this.job.budget, await this.jobService.getJobBudget(this.job))
          break;
        case ActionType.authoriseEscrow:
          action = new IJobAction(this.actionType, this.userType)
          action.amountCan = this.job.budgetCan
          break;
        case ActionType.review:
          action = new IJobAction(this.actionType, this.userType, this.form.value.message)
          action.isClientSatisfied = this.form.value.rating
          break;
        case ActionType.addMessage:
        case ActionType.dispute:
          action = new IJobAction(this.actionType, this.userType, this.form.value.message)
          break;
        case ActionType.acceptTerms:
        case ActionType.declineTerms:
        case ActionType.enterEscrow:
        default:
          action = new IJobAction(this.actionType, this.userType)
          break;
      }
      const success = await this.jobService.handleJobAction(this.job, action);
      if (success) {
        this.result = true;
        this.executing = false;
        this.close();
      } else {
        this.executing = false;
      }
    } catch (e) {
      console.log(e)
      console.log('error');
    }
  }

  get submitDisabled(): boolean {
    if (!this.form) {
      return false;
    }
    return this.form.invalid;
  }

  ngOnInit() {
    switch (this.actionType) {
      case ActionType.counterOffer:
        this.form = this.userType === UserType.provider ?
          this.formBuilder.group({
            budget: [this.job.budget, Validators.compose([Validators.required, Validators.min(1), Validators.max(10000000)])],
            terms: [false, Validators.requiredTrue]
          }) :
          this.formBuilder.group({
            budget: [this.job.budget, Validators.compose([Validators.required, Validators.min(1), Validators.max(10000000)])],
          });
        this.setupCanConverter();
        break;
      case ActionType.addMessage:
        this.form = this.formBuilder.group({
          message: ['', Validators.required],
        })
        break;
      case ActionType.dispute:
        this.form = this.formBuilder.group({
          message: ['', Validators.required],
        })
        break;
      case ActionType.review:
        this.form = this.formBuilder.group({
          message: ['', Validators.compose([Validators.min(0), Validators.max(350)])],
          rating: [null, Validators.required],
        })
        break;
      case ActionType.acceptTerms:
        this.form = this.formBuilder.group({
          terms: [false, Validators.requiredTrue]
        })
        break;
      case ActionType.authoriseEscrow:
      case ActionType.enterEscrow:
      case ActionType.acceptFinish:
        this.handleAction();
        break;
      default:
        break;
    }
  }

  private async setupCanConverter() {
    const canToUsdResp = await this.http.get('https://api.coinmarketcap.com/v2/ticker/2343/?convert=USD').toPromise();
    if (canToUsdResp.ok) {
      this.canToUsd = JSON.parse(canToUsdResp.text())['data']['quotes']['USD']['price'];
    }
  }

  usdToCan(usd: number) {
    return getUsdToCan(this.canToUsd, usd);
  }

  get actionColour(): string {
    return this.jobService.getActionColour(this.actionType);
  }

  get messageBody(): string {
    // TODO: Ensure these messages are correct
    switch (this.actionType) {
      case ActionType.cancelJob:
        return 'Are you sure you wish to cancel this job?';
      case ActionType.declineTerms:
        return 'Once you decline these terms, the job will be cancelled and no further action can be performed on it.' +
          ' Are you sure you wish to decline the terms?';
      case ActionType.counterOffer:
        return 'If you wish to make a counter offer, enter the amount you propose for the job<br/>\nUSD' + this.job.paymentType === PaymentType.hourly ? '/hr' : '';
      case ActionType.acceptTerms:
        return 'Are you sure?';
      case ActionType.authoriseEscrow:
        return 'You are about to pay the agreed amount of CAN to the escrow. Are you sure?';
      case ActionType.enterEscrow:
        return 'This will create a relationship between the provider address and your address in the escrow contract.';
      case ActionType.addMessage:
        return 'Add a note to this job.';
      case ActionType.finishedJob:
        return 'Are you sure you\'ve finished your job?';
      case ActionType.acceptFinish:
        return 'Are you sure you want to finish this job?';
      case ActionType.review:
        return '';
      default:
        return 'Are you sure?';
    }
  }
}
