import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EmailValidator } from '../validators/email';
import { EthAddressValidator } from '../validators/address';

import { AngularFirestore } from 'angularfire2/firestore';

import { UserService } from '../user.service';

import * as moment from 'moment-timezone';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit {

  currentUser: any = JSON.parse(localStorage.getItem('credentials'));

  // Forms
  profileForm: FormGroup = null;

  sending = false;

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private afs: AngularFirestore) {

    if (this.currentUser && !(this.currentUser.colors instanceof Array)) {
      this.currentUser.colors = ['#00FFCC', '#33ccff', '#15EDD8'];
    }

    this.profileForm = formBuilder.group({
      name: [this.currentUser.name || '', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(36)])],
      work: [this.currentUser.work || '', Validators.compose([Validators.required, EmailValidator.isValid])],
      // ethAddress: ['', Validators.compose([Validators.required, EthAddressValidator.isValid])],
      title: [this.currentUser.title || '', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(36)])],
      bio: [this.currentUser.bio || '', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(60)])],
      category: [this.currentUser.category || ''],
      color1: [this.currentUser.colors[0] || '#00FFCC'],
      color2: [this.currentUser.colors[1] || '#33ccff'],
      color3: [this.currentUser.colors[2] || '#15EDD8'],
      description: [this.currentUser.description || '']
    });
  }

  ngOnInit() {
    // this.activatedRoute.params.subscribe((params) => {
    //   if (params['address']) {
    //     this.loadUser(params['address']);
    //   } else {
    //     if (this.currentUser && this.currentUser.address) {
    //       this.loadUser(this.currentUser.address);
    //     }
    //   }
    // });
    if (this.currentUser && this.currentUser.address) {
      this.loadUser(this.currentUser.address);
    }
  }

  loadUser(address: string) {
    try {
      this.afs.doc(`users/${address}`).valueChanges().take(1).subscribe((data: any) => {
        this.currentUser = data;
        if (this.currentUser && !(this.currentUser.colors instanceof Array)) {
          this.currentUser['colors'] = ['#00FFCC', '#33ccff', '#15EDD8'];
        }
        console.log('loadUser - currentUser', this.currentUser);
        console.log('currentUser - type', this.currentUser.type);

        this.profileForm.controls['name'].setValue(this.currentUser.name);
        this.profileForm.controls['work'].setValue(this.currentUser.work);
        // this.profileForm.controls['ethAddress'].setValue( this.currentUser.ethAddress );
        this.profileForm.controls['title'].setValue(this.currentUser.title);
        this.profileForm.controls['bio'].setValue(this.currentUser.bio);
        this.profileForm.controls['category'].setValue(this.currentUser.category);
        this.profileForm.controls['color1'].setValue(this.currentUser.colors[0]);
        this.profileForm.controls['color2'].setValue(this.currentUser.colors[1]);
        this.profileForm.controls['color3'].setValue(this.currentUser.colors[2]);
        this.profileForm.controls['description'].setValue(this.currentUser.description);
      });
    } catch (error) {
      console.error('loadUser - error', error);
    }
  }

  onProfile(category1: any, category2: any, category3: any, category4: any, category5: any, category6: any) {
    try {
      this.sending = true;

      console.log('onProfile', category1, category2, category3, category4, category5, category6);

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
        // ethAddress: this.profileForm.value.ethAddress,
        title: this.profileForm.value.title,
        bio: this.profileForm.value.bio,
        category: category,
        colors: [this.profileForm.value.color1, this.profileForm.value.color2, this.profileForm.value.color3],
        description: this.profileForm.value.description,
        timezone: moment.tz.guess(),
        // badge: 'Pioneer',
        state: 'Done',
      };

      console.log('onProfile', tmpUser);

      this.userService.saveUser( tmpUser );
      // this.router.navigate(['/profile']);
      if ( (<any>window).$('html, body') ) {
        (<any>window).$('html, body').animate({scrollTop : 0}, 600);
      }
      setTimeout( () => {
        this.router.navigate(['/profile']);
        this.sending = false;
      }, 600 );
    } catch (error) {
      console.error('onProfile - error', error);
    }
  }

}
