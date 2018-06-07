import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { User } from 'firebase/app';
import { ProfileComponent } from '../../profile.component';

@Component({
  selector: 'app-profile-about',
  templateUrl: './about.component.html',
  styleUrls: ['../../profile.component.css']
})
export class AboutComponent implements OnInit {

  @Input() userModel: any;
  @Input() currentUser: User;

  constructor(private router: Router) { }

  ngOnInit() { }

  proposeJob() {
    this.router.navigate(['/post', this.userModel.address]);
  }


}

