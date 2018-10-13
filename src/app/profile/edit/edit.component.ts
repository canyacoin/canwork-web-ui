import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EthService } from '@canyaio/canpay-lib';
import { User } from '@class/user';
import { AuthService } from '@service/auth.service';
import { UserService } from '@service/user.service';
import { CurrencyValidator } from '@validator/currency.validator';
import { EmailValidator } from '@validator/email.validator';
import { EthereumValidator } from '@validator/ethereum.validator';
import { Subscription } from 'rxjs/Subscription';

import * as moment from 'moment-timezone';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit, OnDestroy {

  @Input() currentUser: User
  ethSub: Subscription

  @Output() close = new EventEmitter
  displayIpfsDropzone = false
  dropzoneConfig = {
    acceptedFiles: {
      value: 'image/jpg,image/png,image/jpeg',
      error: 'Only (jpeg, jpg or png) image files are accepted'
    },
    maxFilesize: {
      value: 1000000,
      error: 'Please add image files smaller than 1mb'
    }
  }

  profileForm: FormGroup = null
  sending = false

  skillTagsList: string[] = []
  tagSelectionInvalid = false
  acceptedTags: string[] = []
  tagInput = ''

  ethAddress: string

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private ethService: EthService,
    private authService: AuthService) {
    this.ethSub = this.ethService.account$.subscribe(async (address: string) => {
      this.ethAddress = address
    })
  }

  ngOnInit() {
    if (this.currentUser != null) {
      this.buildForm()
    }
  }

  ngOnDestroy() {
    if (this.ethSub) { this.ethSub.unsubscribe() }
  }

  onProfileImageUpload(ipfsResponse) {
    this.currentUser.avatar.uri = `https://ipfs.io/ipfs/${ipfsResponse.hash}`
    this.displayIpfsDropzone = false
  }

  onClose() {
    this.close.emit(true)
  }

  buildForm() {
    this.profileForm = this.formBuilder.group({
      name: [this.currentUser.name || '', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(36)])],
      work: [this.currentUser.work || '', Validators.compose([Validators.required, EmailValidator.isValid])],
      ethAddress: [this.currentUser.ethAddress || this.ethAddress, Validators.compose([Validators.required, EthereumValidator.isValidAddress]), EthereumValidator.isUniqueAddress(this.userService.usersCollectionRef, this.currentUser)],
      title: [this.currentUser.title || '', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(36)])],
      bio: [this.currentUser.bio || '', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(60)])],
      category: [this.currentUser.category || ''],
      skillTags: [''],
      hourlyRate: [this.currentUser.hourlyRate || '', Validators.compose([CurrencyValidator.isValid])],
      color1: [this.currentUser.colors[0]],
      color2: [this.currentUser.colors[1]],
      color3: [this.currentUser.colors[2]],
      description: [this.currentUser.description || '']
    });
  }

  skillTagsUpdated(value: string) {
    this.profileForm.controls['skillTags'].setValue(value);
  }

  save(category1: any, category2: any, category3: any, category4: any, category5: any, category6: any) {
    this.sending = true;

    let category = 'CONTENT CREATORS';
    if (category2.checked) {
      category = 'DESIGNERS & CREATIVES';
    }
    if (category3.checked) {
      category = 'FINANCIAL EXPERTS';
    }
    if (category4.checked) {
      category = 'MARKETING & SEO';
    }
    if (category5.checked) {
      category = 'SOFTWARE DEVELOPERS';
    }
    if (category6.checked) {
      category = 'VIRTUAL ASSISTANTS';
    }

    let tags: string[] = this.profileForm.value.skillTags === '' ? [] : this.profileForm.value.skillTags.split(',').map(item => item.trim());
    if (tags.length > 6) {
      tags = tags.slice(0, 6);
    }
    const tmpUser = {
      address: this.currentUser.address,
      name: this.profileForm.value.name,
      work: this.profileForm.value.work,
      ethAddress: this.profileForm.value.ethAddress,
      title: this.profileForm.value.title,
      bio: this.profileForm.value.bio,
      category: category,
      skillTags: tags,
      hourlyRate: this.profileForm.value.hourlyRate,
      colors: [this.profileForm.value.color1, this.profileForm.value.color2, this.profileForm.value.color3],
      description: this.profileForm.value.description,
      timezone: moment.tz.guess()
    };

    // tslint:disable-next-line:forin
    for (const k in tmpUser) {
      this.currentUser[k] = tmpUser[k];
    }

    this.userService.saveUser(this.currentUser);
    this.authService.setUser(this.currentUser);
    setTimeout(() => {
      // DESTROY the edit overlay
      this.onClose()
      this.sending = false;
    }, 600);
  }
}
