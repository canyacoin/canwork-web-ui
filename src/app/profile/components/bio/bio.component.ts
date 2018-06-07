import { Component, Input, OnInit } from '@angular/core';

import { User } from 'firebase/app';

@Component({
  selector: 'app-profile-bio',
  templateUrl: './bio.component.html',
  styleUrls: ['../../profile.component.css']
})
export class BioComponent implements OnInit {

  @Input() userModel: any;
  @Input() currentUser: User;

  constructor() { }

  ngOnInit() { }

}
