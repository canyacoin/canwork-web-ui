import { Component, Input, OnInit, Directive } from '@angular/core'

@Directive()
@Component({
  selector: 'app-v-stepper',
  templateUrl: './v-stepper.component.html',
  styleUrls: ['./v-stepper.component.css'],
})
export class VStepperComponent implements OnInit {
  @Input() steps = []
  @Input() currentStep: any

  constructor() {}

  ngOnInit() {
    this.currentStep = this.currentStep || this.steps[0]
  }
}
