import { Location } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import * as moment from 'moment-timezone';
import { User, UserState } from '../core-classes/user';
import { UserService } from '../core-services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, AfterViewInit, OnDestroy {

  currentUser: User = JSON.parse(localStorage.getItem('credentials'));
  userModel: User = null;

  paramsSub: Subscription;

  constructor(private router: Router,
    private location: Location,
    private activatedRoute: ActivatedRoute,
    private userService: UserService) {
  }

  ngOnInit() {
    this.setUsersColors(this.currentUser);
  }

  ngOnDestroy() {
    if (this.paramsSub) { this.paramsSub.unsubscribe(); }
  }

  ngAfterViewInit() {
    this.paramsSub = this.activatedRoute.params.subscribe((params) => {
      if (params['address'] && params['address'] !== 'setup') {
        this.loadUser(params['address']);
      } else if (this.currentUser) {
        this.loadUser(this.currentUser.address);
      }
    });
  }

  loadUser(address: string) {
    this.userService.getUser(address).then((user: User) => {
      this.userModel = user;
      this.setUsersColors(this.userModel);
      this.saveWhoViewProfile();
    }).catch(err => {
      console.log('loadUser: error');
    });
  }

  setUsersColors(user: User) {
    if (user && user.colors.length <= 0) {
      user.colors = ['#00FFCC', '#33ccff', '#15EDD8'];
    }
  }

  saveWhoViewProfile() {
    if (this.notMyProfile()) {
      this.userService.saveProfileView(this.currentUser, this.userModel.address);
    }
  }

  onBack() {
    if ((<any>window).history.length > 0) {
      this.location.back();
    } else {
      this.router.navigate(['/home']);
    }
  }

  isMyProfile() {
    return (this.userModel && (this.userModel.address === this.currentUser.address));
  }

  notMyProfile() {
    return (this.userModel && (this.userModel.address !== this.currentUser.address));
  }
}

