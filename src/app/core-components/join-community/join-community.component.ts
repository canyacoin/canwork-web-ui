import { Component } from '@angular/core'
import { JoinCommunityService } from 'app/shared/constants/home-page'

@Component({
  selector: 'join-community',
  templateUrl: './join-community.component.html',
})
export class JoinCommunityComponent {
  joinSection = JoinCommunityService
}
