import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { User } from '../../../core-classes/user';
import { AuthService } from '../../../core-services/auth.service';
import { ProfileComponent } from '../../profile.component';

@Component({
  selector: 'app-profile-about',
  templateUrl: './about.component.html',
  styleUrls: ['../../profile.component.css']
})
export class AboutComponent implements OnInit {

  @Input() userModel: User;
  @Input() isMyProfile: boolean;

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit() {   
  }

  proposeJob() {
    this.authService.currentUser$.take(1).subscribe((user: User) => {
      if (user) {
        this.router.navigate(['inbox/post', this.userModel.address]);
      } else {
        this.router.navigate(['auth/login']);
      } 
    });
  }

}

