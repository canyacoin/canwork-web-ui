import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-v-stepper',
  templateUrl: './v-stepper.component.html',
  styleUrls: ['./v-stepper.component.css']
})
export class VStepperComponent implements OnInit {

  @Input() steps = [];
  @Input() currentStep: any;

  constructor() { }

  ngOnInit() {
    this.currentStep = this.currentStep || this.steps[0];
  }

}
