import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import * as moment from 'moment-timezone';
import { User, UserState, UserType } from '../../../core-classes/user';
import { AuthService } from '../../../core-services/auth.service';
import { UserService } from '../../../core-services/user.service';
import { CurrencyValidator } from '../../currency.validator';
import { EmailValidator } from '../../email.validator';

@Component({
  selector: 'app-create-client-profile',
  templateUrl: './create-client-profile.component.html',
  styleUrls: ['./create-client-profile.component.css']
})
export class CreateClientProfileComponent implements OnInit {

  @Input() user: User;
  steps = {
    'aboutYou': {
      num: 0,
      name: 'aboutYou',
      title: 'About You',
      icon: '1'
    },
    'yourProfile': {
      num: 1,
      name: 'yourProfile',
      title: 'Your Profile',
      icon: '2'
    },
    'complete': {
      num: 2,
      name: 'complete',
      title: 'Complete',
      icon: '3'
    }
  };
  stepperSteps = [];
  currentStep: any;
  sending = false;

  profileForm: FormGroup = null;
  termsChecked = false;

  constructor(private userService: UserService,
    private formBuilder: FormBuilder, private router: Router, private authService: AuthService) { }

  ngOnInit() {
    if (this.user != null) {
      this.buildForm();
    }
    this.stepperSteps = Object.values(this.steps);
    this.currentStep = this.stepperSteps[0];
  }

  buildForm() {
    this.profileForm = this.formBuilder.group({
      firstName: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(18)])],
      lastName: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(18)])],
      work: [this.user.work || '', Validators.compose([Validators.required, EmailValidator.isValid])],
      title: [this.user.title || '', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(36)])],
      bio: [this.user.bio || '', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(60)])],
      description: [this.user.description || '', Validators.compose([Validators.maxLength(500)])],
      // category: [this.user.category || ''],
      // skillTags: [''],
      // hourlyRate: [this.user.hourlyRate || '', Validators.compose([CurrencyValidator.isValid])],
      color1: [this.user.colors[0]],
      color2: [this.user.colors[1]],
      color3: [this.user.colors[2]],
    });
  }

  nextStep() {
    if (this.stepperSteps.length > this.currentStep.num + 1) {
      this.currentStep = this.stepperSteps[this.currentStep.num + 1];
    }
  }

  submitForm() {
    this.user.state = UserState.done;
    this.userService.saveUser(this.user);
    this.sending = true;

    const tmpUser = {
      address: this.user.address,
      name: this.profileForm.value.firstName + this.profileForm.value.lastName,
      work: this.profileForm.value.work,
      title: this.profileForm.value.title,
      bio: this.profileForm.value.bio,
      // category: category,
      // skillTags: tags,
      // hourlyRate: this.profileForm.value.hourlyRate,
      colors: [this.profileForm.value.color1, this.profileForm.value.color2, this.profileForm.value.color3],
      description: this.profileForm.value.description,
      timezone: moment.tz.guess()
    };

    // tslint:disable-next-line:forin
    for (const k in tmpUser) {
      this.user[k] = tmpUser[k];
    }

    this.userService.saveUser(this.user);
    this.authService.setUser(this.user);
    setTimeout(() => {
      this.nextStep();
    }, 600);
  }

}
