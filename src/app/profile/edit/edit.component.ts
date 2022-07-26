import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { User } from '@class/user'
import { AuthService } from '@service/auth.service'
import { UserService } from '@service/user.service'
import { CurrencyValidator } from '@validator/currency.validator'
import { EmailValidator } from '@validator/email.validator'
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper'

import * as moment from 'moment-timezone'

import { BscValidator } from '@validator/bsc.validator'
import { BscService } from '@service/bsc.service'

@Component({
  selector: 'app-profile-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements OnInit, OnDestroy {
  @Input() currentUser: User

  @Output() close = new EventEmitter()
  displayDropzone = false
  dropzoneConfig: DropzoneConfigInterface = {
    acceptedFiles: 'image/jpg,image/png,image/jpeg',
    maxFilesize: 1,
  }
  filePath: string

  profileForm: FormGroup = null
  sending = false

  skillTagsList: string[] = []
  tagSelectionInvalid = false
  acceptedTags: string[] = []
  tagInput = ''

  bnbAddress: string
  bscAddress: string
  preview = false

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private bscService: BscService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (this.currentUser != null) {
      this.filePath = `uploads/avatars/${this.currentUser.address}`
      this.buildForm()
    }
  }

  ngOnDestroy() {}

  onProfileImageUpload(url) {
    console.log('uploaded url', url)
    this.currentUser = {
      ...this.currentUser,
      avatar: {
        ...this.currentUser.avatar,
        uri: url,
      },
    }
    this.displayDropzone = false
  }

  onClose() {
    this.close.emit(true)
  }

  onTogglePreview() {
    this.preview = !this.preview
  }

  buildForm() {
    this.profileForm = this.formBuilder.group({
      name: [
        this.currentUser.name || '',
        Validators.compose([
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(36),
        ]),
      ],
      work: [
        this.currentUser.work || '',
        Validators.compose([Validators.required, EmailValidator.isValid]),
      ],
      bscAddress: [
        this.currentUser.bscAddress || this.bscAddress,
        () => null,
        Validators.composeAsync([
          new BscValidator(this.bscService, this.userService)
            .isValidAddressField,
          new BscValidator(
            this.bscService,
            this.userService
          ).isUniqueAddressField(this.currentUser),
        ]),
      ],
      title: [
        this.currentUser.title || '',
        Validators.compose([
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(36),
        ]),
      ],
      bio: [
        this.currentUser.bio || '',
        Validators.compose([
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(60),
        ]),
      ],
      category: [this.currentUser.category || ''],
      skillTags: [''],
      hourlyRate: [
        this.currentUser.hourlyRate || '',
        Validators.compose([CurrencyValidator.isValid]),
      ],
      color1: [this.currentUser.colors[0]],
      color2: [this.currentUser.colors[1]],
      color3: [this.currentUser.colors[2]],
      description: [this.currentUser.description || ''],
    })
  }

  skillTagsUpdated(value: string) {
    this.profileForm.controls['skillTags'].setValue(value)
  }

  save(
    category1: any,
    category2: any,
    category3: any,
    category4: any,
    category5: any,
    category6: any
  ) {
    this.sending = true

    let category = 'CONTENT CREATORS'
    if (category2.checked) {
      category = 'DESIGNERS & CREATIVES'
    }
    if (category3.checked) {
      category = 'FINANCIAL EXPERTS'
    }
    if (category4.checked) {
      category = 'MARKETING & SEO'
    }
    if (category5.checked) {
      category = 'SOFTWARE DEVELOPERS'
    }
    if (category6.checked) {
      category = 'VIRTUAL ASSISTANTS'
    }

    let tags: string[] =
      this.profileForm.value.skillTags === ''
        ? []
        : this.profileForm.value.skillTags.split(',').map(item => item.trim())
    if (tags.length > 6) {
      tags = tags.slice(0, 6)
    }
    const tmpUser = {
      address: this.currentUser.address,
      name: this.profileForm.value.name,
      work: this.profileForm.value.work,
      bnbAddress: this.profileForm.value.bnbAddress,
      bscAddress: this.profileForm.value.bscAddress,
      title: this.profileForm.value.title,
      bio: this.profileForm.value.bio,
      category: category,
      skillTags: tags,
      hourlyRate: this.profileForm.value.hourlyRate,
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
      this.currentUser[k] = tmpUser[k]
    }

    this.userService.saveUser(this.currentUser)
    this.authService.setUser(this.currentUser)
    setTimeout(() => {
      // DESTROY the edit overlay
      this.onClose()
      this.sending = false
    }, 600)
  }
}
