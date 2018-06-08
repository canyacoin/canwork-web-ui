import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import * as moment from 'moment-timezone';
import { User, UserState } from '../../core-classes/user';
import { AuthService } from '../../core-services/auth.service';
import { UserService } from '../../core-services/user.service';
import { EmailValidator } from './email.validator';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent {

  currentUser: User = JSON.parse(localStorage.getItem('credentials'));

  profileForm: FormGroup = null;
  sending = false;

  constructor(private router: Router,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private authService: AuthService) {
    this.profileForm = formBuilder.group({
      name: [this.currentUser.name || '', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(36)])],
      work: [this.currentUser.work || '', Validators.compose([Validators.required, EmailValidator.isValid])],
      title: [this.currentUser.title || '', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(36)])],
      bio: [this.currentUser.bio || '', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(60)])],
      category: [this.currentUser.category || ''],
      color1: [this.currentUser.colors[0]],
      color2: [this.currentUser.colors[1]],
      color3: [this.currentUser.colors[2]],
      description: [this.currentUser.description || '']
    });
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

    const tmpUser = {
      address: this.currentUser.address,
      name: this.profileForm.value.name,
      work: this.profileForm.value.work,
      title: this.profileForm.value.title,
      bio: this.profileForm.value.bio,
      category: category,
      colors: [this.profileForm.value.color1, this.profileForm.value.color2, this.profileForm.value.color3],
      description: this.profileForm.value.description,
      timezone: moment.tz.guess(),
      state: UserState.done,
    };

    // tslint:disable-next-line:forin
    for (const k in tmpUser) {
      this.currentUser[k] = tmpUser[k];
    }

    this.userService.saveUser(this.currentUser);
    setTimeout(() => {
      this.router.navigate(['/profile']);
      this.sending = false;
    }, 600);
  }
}
