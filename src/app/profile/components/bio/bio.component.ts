import { Component, Input, OnInit, Directive } from '@angular/core'

import { User } from '@class/user'

@Component({
  selector: 'app-profile-bio',
  templateUrl: './bio.component.html',
})
export class BioComponent implements OnInit {
  @Input() userModel: User
  @Input() isMyProfile: boolean

  constructor() {}

  ngOnInit() {}
}
