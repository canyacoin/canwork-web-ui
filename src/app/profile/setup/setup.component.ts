import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { User, UserState, UserType } from '../../core-classes/user';
import { AuthService } from '../../core-services/auth.service';
import { UserService } from '../../core-services/user.service';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.css'],
})

export class SetupComponent implements OnInit, OnDestroy {

  currentUser: User;
  authSub: Subscription;

  constructor(private userService: UserService, private router: Router, private authService: AuthService) { }

  ngOnInit() {
    this.authSub = this.authService.currentUser$.subscribe((user: User) => {
      this.currentUser = user;
    }, error => { console.error('! unable to retrieve currentUser data:', error); });
  }
  ngOnDestroy() {
    if (this.authSub) { this.authSub.unsubscribe(); }
  }

  get isClient(): boolean {
    return this.currentUser.type === UserType.client;
  }

  get isProvider(): boolean {
    return this.currentUser.type === UserType.provider;
  }

  get whitelistSubmitted(): boolean {
    return this.currentUser.whitelistSubmitted;
  }

  setUserType(type: UserType) {
    this.currentUser.type = type;
    this.userService.updateUserProperty(this.currentUser, 'type', type);
  }
}
