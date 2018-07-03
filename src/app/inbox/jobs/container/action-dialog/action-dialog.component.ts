import { AfterViewInit, Component, ComponentRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Http, Response } from '@angular/http';
import { DialogComponent, DialogService } from 'ng2-bootstrap-modal';

import { Job, PaymentType } from '@class/job';

import {
    ActionType,
    AddMessageAction,
    CounterOfferAction,
    IJobAction,
    RaiseDisputeAction,
    EnterEscrowAction
} from '@class/job-action';

import { UserType } from '@class/user';
import { JobService } from '@service/job.service';
import { getUsdToCan } from '@util/currency-conversion';

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
export class ActionDialogComponent extends DialogComponent<ActionDialogOptions, boolean> implements ActionDialogOptions, AfterViewInit {

  actionType: ActionType;
  userType: UserType;

  job: Job;
  action: IJobAction;

  actionTypes = ActionType;
  paymentTypes = PaymentType;

  canToUsd: number;
  form: FormGroup = null;

  constructor(dialogService: DialogService, private formBuilder: FormBuilder, private jobService: JobService, private http: Http) {
    super(dialogService);
  }

  async handleAction() {
    try {
      let action: IJobAction;
      switch (this.actionType) {
        case ActionType.counterOffer:
          action = new CounterOfferAction(this.userType, this.form.value.budget);
          break;
        case ActionType.addMessage:
          action = new AddMessageAction(this.userType, 'Messageeeee');
          break;
        case ActionType.dispute:
          action = new RaiseDisputeAction(this.userType, ''); // TODO: Add value from form here
          break;
        case ActionType.enterEscrow:
          action = new EnterEscrowAction(this.userType, '', 0)
          break;
        default:
          action = new IJobAction(this.actionType, this.userType);
          break;
      }
      const success = await this.jobService.handleJobAction(this.job, action);
      if (success) {
        this.result = true;
        this.close();
      }
    } catch (e) {
      console.log('error');
    }
  }

  get submitDisabled(): boolean {
    if (!this.form) {
      return false;
    }
    return this.form.invalid;
  }

  ngAfterViewInit() {
    switch (this.actionType) {
      case ActionType.counterOffer:
        this.form = this.formBuilder.group({
          budget: [this.job.budget, Validators.compose([Validators.required, Validators.min(1), Validators.max(10000000)])]
        });
        this.setupCanConverter();
        break;
      case ActionType.addMessage:
      case ActionType.dispute:
        // TODO: Set form to accept message using formbuilder example above
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
      case ActionType.enterEscrow:
        return 'You are about to pay the agreed amount of CAN to the escrow. Are you sure?';
      case ActionType.addMessage:
        return 'Are you sure?';
      case ActionType.finishedJob:
        return 'Are you sure?';
      case ActionType.acceptFinish:
        return 'Are you sure?';
      default:
        return 'Are you sure?';
    }
  }
}
