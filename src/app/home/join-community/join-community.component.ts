import { Component } from '@angular/core'
import { JoinCommunityService } from 'app/shared/constants/home'

@Component({
  selector: 'home-join-community',
  templateUrl: './join-community.component.html',
})
export class JoinCommunityComponent {
  joinSection = JoinCommunityService;
}
