import { Component, Input, OnDestroy, OnInit, Directive } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { User, UserCategory, UserState, UserType } from '@class/user'
import { AuthService } from '@service/auth.service'
import { UserService } from '@service/user.service'
import { CurrencyValidator } from '@validator/currency.validator'
import { EmailValidator } from '@validator/email.validator'
import * as randomColor from 'randomcolor'
import { Subscription } from 'rxjs'

import { BscValidator } from '@validator/bsc.validator'
import { BscService } from '@service/bsc.service'

import * as moment from 'moment-timezone'

@Directive()
@Component({
  selector: 'app-create-provider-profile',
  templateUrl: './create-provider-profile.component.html',
  styleUrls: [
    './create-provider-profile.component.css',
    '../setup.component.css',
  ],
})
export class CreateProviderProfileComponent implements OnInit, OnDestroy {
  @Input() user: User
  steps = {
    professionalInfo: {
      num: 0,
      name: 'professionalInfo',
      title: 'Professional',
      icon: '1',
    },
    yourProfile: {
      num: 1,
      name: 'yourProfile',
      title: 'Your Profile',
      icon: '2',
    },
    complete: {
      num: 2,
      name: 'complete',
      title: 'Complete',
      icon: '3',
    },
  }
  stepperSteps = []
  currentStep: any
  sending = false

  profileForm: FormGroup = null
  termsChecked = false

  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private bscService: BscService
  ) {}

  ngOnInit() {
    if (this.user != null) {
      this.buildForm()
    }
    this.stepperSteps = Object.values(this.steps)
    this.currentStep = this.stepperSteps[0]
  }

  ngOnDestroy() {}

  buildForm() {
    const colors = randomColor({ luminosity: 'light', count: 3 })

    this.profileForm = this.formBuilder.group({
      firstName: [
        this.user.name ? this.user.name.split(' ')[0] : '',
        Validators.compose([
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(18),
        ]),
      ],
      lastName: [
        this.user.name ? this.user.name.split(' ')[1] : '',
        Validators.compose([
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(18),
        ]),
      ],
      work: [
        this.user.email || '',
        Validators.compose([Validators.required, EmailValidator.isValid]),
      ],
      title: [
        this.user.description || '',
        Validators.compose([
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(36),
        ]),
      ],
      bio: [
        this.user.bio || '',
        Validators.compose([
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(60),
        ]),
      ],
      description: [
        this.user.description || '',
        Validators.compose([Validators.maxLength(500)]),
      ],
      category: [
        this.user.category || '',
        Validators.compose([Validators.required]),
      ],
      skillTags: [
        '',
        Validators.compose([
          Validators.minLength(0),
          Validators.maxLength(100),
        ]),
      ],
      hourlyRate: [
        this.user.hourlyRate || '',
        Validators.compose([Validators.required, CurrencyValidator.isValid]),
      ],
      bscAddress: [
        this.user.bscAddress || '',
        () => null,
        Validators.composeAsync([
          (bscAddress) => Promise.resolve(Validators.required(bscAddress)),
          new BscValidator(this.bscService, this.userService)
            .isValidAddressField,
          new BscValidator(
            this.bscService,
            this.userService
          ).isUniqueAddressField(this.user),
        ]),
      ],
      color1: [colors[0]],
      color2: [colors[1]],
      color3: [colors[2]],
      terms: [false, Validators.requiredTrue],
      timezone: moment.tz.guess(),
      referredBy: [],
    })
  }

  categories(): Array<string> {
    const values = Object.values(UserCategory)
    return values
  }

  skillTagsUpdated(value: string) {
    this.profileForm.controls['skillTags'].setValue(value)
  }

  nextStep() {
    if (this.stepperSteps.length > this.currentStep.num + 1) {
      this.currentStep = this.stepperSteps[this.currentStep.num + 1]
    }
  }

  submitForm() {
    this.sending = true

    let tags: string[] =
      this.profileForm.value.skillTags === ''
        ? []
        : this.profileForm.value.skillTags.split(',').map((item) => item.trim())
    if (tags.length > 6) {
      tags = tags.slice(0, 6)
    }
    const tmpUser = {
      address: this.user.address,
      name:
        this.profileForm.value.firstName +
        ' ' +
        this.profileForm.value.lastName,
      work: this.profileForm.value.work,
      title: this.profileForm.value.title,
      bio: this.profileForm.value.bio,
      category: this.profileForm.value.category,
      skillTags: tags,
      hourlyRate: this.profileForm.value.hourlyRate,
      bscAddress: this.profileForm.value.bscAddress,
      colors: [
        this.profileForm.value.color1,
        this.profileForm.value.color2,
        this.profileForm.value.color3,
      ],
      description: this.profileForm.value.description,
      timezone: moment.tz.guess(),
    }

    // tslint:disable-next-line:forin
    for (const k in tmpUser) {
      this.user[k] = tmpUser[k]
    }

    this.userService.saveUser(this.user)
    this.authService.setUser(this.user)
    setTimeout(() => {
      this.sending = false
      this.nextStep()
    }, 600)
  }

  proceed() {
    this.sending = true
    this.user.whitelistSubmitted = true
    this.user.whitelisted = true
    this.user.referredBy = this.profileForm.value.referredBy
    this.userService.saveUser(this.user)
  }
}
