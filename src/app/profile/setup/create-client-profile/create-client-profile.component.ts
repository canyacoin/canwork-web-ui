import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { User, UserState, UserType } from '@class/user';
import { AuthService } from '@service/auth.service';
import { CanWorkEthService } from '@service/eth.service';
import { UserService } from '@service/user.service';
import { EmailValidator } from '@validator/email.validator';
import { EthereumValidator } from '@validator/ethereum.validator';
import * as randomColor from 'randomcolor';
import { Subscription } from 'rxjs/Subscription';

import * as moment from 'moment-timezone';

@Component({
  selector: 'app-create-client-profile',
  templateUrl: './create-client-profile.component.html',
  styleUrls: ['./create-client-profile.component.css', '../setup.component.css']
})
export class CreateClientProfileComponent implements OnInit {

  returnUrl: string;

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

  ethAddress: string
  ethSub: Subscription

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private router: Router,
    private ethService: CanWorkEthService,
    private authService: AuthService) { }

  ngOnInit() {
    if (this.user != null) {
      this.buildForm();
    }
    this.stepperSteps = Object.values(this.steps);
    this.currentStep = this.stepperSteps[0];
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    this.ethAddress = this.ethService.getOwnerAccount();
  }

  buildForm() {
    const colors = randomColor({ luminosity: 'light', count: 3 });

    this.profileForm = this.formBuilder.group({
      firstName: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(18)])],
      lastName: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(18)])],
      work: [this.user.email || '', Validators.compose([Validators.required, EmailValidator.isValid])],
      title: [this.user.title || '', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(36)])],
      bio: [this.user.bio || '', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(60)])],
      description: [this.user.description || '', Validators.compose([Validators.maxLength(500)])],
      color1: [colors[0]],
      color2: [colors[1]],
      color3: [colors[2]],
      terms: [false, Validators.requiredTrue],
      timezone: moment.tz.guess(),
      ethAddress: [this.user.ethAddress || this.ethAddress, Validators.compose([Validators.required, EthereumValidator.isValidAddress]), EthereumValidator.isUniqueAddress(this.userService.usersCollectionRef, this.user)],
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
      name: this.profileForm.value.firstName + ' ' + this.profileForm.value.lastName,
      work: this.profileForm.value.work,
      title: this.profileForm.value.title,
      bio: this.profileForm.value.bio,
      colors: [this.profileForm.value.color1, this.profileForm.value.color2, this.profileForm.value.color3],
      description: this.profileForm.value.description,
      timezone: moment.tz.guess(),
      ethAddress: this.profileForm.value.ethAddress,
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

  proceed() {
    this.router.navigate([this.returnUrl]);
  }

}
