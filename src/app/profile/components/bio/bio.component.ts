import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core'

import { User } from '@class/user'

@Component({
  selector: 'app-profile-bio',
  templateUrl: './bio.component.html',
})
export class BioComponent implements OnInit {
  @Input() userModel!: User
  @Input() isMyProfile: boolean

  @Output() editBio = new EventEmitter()

  constructor() {}

  ngOnInit() {}

  showEditBioDialog() {
    this.editBio.emit()
  }
}
