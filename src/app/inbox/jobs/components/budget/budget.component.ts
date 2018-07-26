import { Component, Input } from '@angular/core';

import { Job, PaymentType } from '../../../../core-classes/job';

@Component({
  selector: 'app-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.css']
})
export class BudgetComponent {

  @Input() job: Job;
  paymentType = PaymentType;

  constructor() { }


}
