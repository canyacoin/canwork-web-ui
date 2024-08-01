import { Component, Input, EventEmitter, Output } from '@angular/core'

import { User } from '@class/user'
@Component({
  selector: 'profile-skills',
  templateUrl: './skills.component.html',
})
export class SkillsComponent {
  @Input() userModel!: User
  @Input() isMyProfile: boolean

  @Output() editBio = new EventEmitter()

  constructor() {}

  ngOnInit() {}

  showEditBioDialog() {
    this.editBio.emit()
  }
}
