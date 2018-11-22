import { Location } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '@class/user';
import { AuthService } from '@service/auth.service';
import { UserService } from '@service/user.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  currentUser: User;
  userModel: User;
  authSub: Subscription;

  paramsSub: Subscription;

  displayEditComponent = false;

  constructor(
    private router: Router,
    private location: Location,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private authService: AuthService) {
  }

  ngOnInit() {
    this.authSub = this.authService.currentUser$.subscribe((user: User) => {
      if (user !== this.currentUser) {
        this.currentUser = user;
        this.activatedRoute.params.pipe(take(1)).subscribe((params) => {
          this.initUsers(this.currentUser, params);
        });
        this.activatedRoute.queryParams.subscribe(params => {
          this.displayEditComponent = params.editProfile ? true : false;
        });
      }
<<<<<<< HEAD
<<<<<<< HEAD
    }, error => { console.error('! unable to retrieve currentUser data:', error); });
=======
    }, error => {
      console.error('! unable to retrieve currentUser data:', error);
    });
>>>>>>> basic job getter and checker works
=======
    }, error => {
      console.error('! unable to retrieve currentUser data:', error);
    });
>>>>>>> 8b5176a69420c74657b1de064f232d779cf6fdb3
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

  closeEditDialog() {
    this.displayEditComponent = false;
    this.router.navigate(['.'], { relativeTo: this.activatedRoute, queryParams: {} });
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

