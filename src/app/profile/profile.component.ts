import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import * as moment from 'moment-timezone';
import { User, UserState, UserType } from '../core-classes/user';
import { AuthService } from '../core-services/auth.service';
import { UserService } from '../core-services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {

  currentUser: User;
  userModel: User;
  authSub: Subscription;

  paramsSub: Subscription;

  constructor(private router: Router,
    private location: Location,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private authService: AuthService) {
  }

  ngOnInit() {
    this.authSub = this.authService.currentUser$.subscribe((user: User) => {
      if (user !== this.currentUser) {
        this.currentUser = user;
        this.setUsersColors(this.currentUser);
        this.activatedRoute.params.take(1).subscribe((params) => {
          this.initUsers(this.currentUser, params);
        });
      }
    }, error => { console.error('! unable to retrieve currentUser data:', error) });
  }

  ngOnDestroy() {
    if (this.paramsSub) { this.paramsSub.unsubscribe(); }
    if (this.authSub) { this.authSub.unsubscribe(); }
  }

  initUsers(user: User, params: any) {
    if (params['address'] && params['address'] !== 'setup') {
      this.loadUser(params['address']);
    } else if (user) {
      this.userModel = this.currentUser;
      this.setUsersColors(this.userModel);
    }
  }

  loadUser(address: string) {
    this.userService.getUser(address).then((user: User) => {
      this.userModel = user;
      this.setUsersColors(this.userModel);
      this.saveWhoViewProfile();
      this.addToViewedProfileList();
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
    if (this.notMyProfile() && this.currentUser) {
      this.userService.saveProfileView(this.currentUser, this.userModel.address);
    }
  }

  addToViewedProfileList() {
    if (this.notMyProfile) {
      console.log('Can Add this guy to my list...');
      this.userService.addToViewedUsers(this.currentUser.address, this.userModel);
    }
  }


  isMyProfile() {
    if (this.currentUser == null) {
      return false;
    }
    return (this.userModel && (this.userModel.address === this.currentUser.address));
  }

  notMyProfile() {
    if (!this.currentUser && this.userModel) {
      return true;
    }
    return (this.userModel && (this.userModel.address !== this.currentUser.address));
  }
}

