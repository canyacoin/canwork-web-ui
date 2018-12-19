import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { User, UserState, UserType } from '../../core-classes/user';
import { AuthService } from '../../core-services/auth.service';
import { UserService } from '../../core-services/user.service';
import { DockIoService } from '@service/dock-io.service';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.css'],
})

export class SetupComponent implements OnInit, OnDestroy {

  currentUser: User;
  authSub: Subscription;

  constructor(
    private userService: UserService,
    private router: Router,
    private dockIoService: DockIoService,
    private authService: AuthService) { }

  ngOnInit() {
    this.authSub = this.authService.currentUser$.subscribe((user: User) => {
      if (user) {
        const isFromDockContext = user['@context'] && user['@context'] === 'https://dock.io';
        if (isFromDockContext) {
          this.syncDockAuthData(user);
        } else {
          this.currentUser = user;
        }
      }
    }, error => { console.error('! unable to retrieve currentUser data:', error); });
  }

  ngOnDestroy() {
    if (this.authSub) { this.authSub.unsubscribe(); }
  }

  async syncDockAuthData(user: User) {
    const connectionAddress = this.dockIoService.getLocalConnectionAddress();
    const querySnapshot = await this.dockIoService.getDockSchemaByConnectionAddress(connectionAddress);
    if (!querySnapshot.empty) {
      querySnapshot.forEach((qs: any) => {
        const record = qs.data();
        user.work = record.email;
        user.name = record.name;
        user.bio = record.bio;
        user.description = record.headline;
        user.avatar.uri = record.avatar || user.avatar.uri;
        this.currentUser = user;
      });
    }
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
