import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DockIoService } from '@service/dock-io.service';
import { AuthService } from '@service/auth.service';
import { User } from '@class/user';
import { UserService } from '@service/user.service';
import * as firebase from 'firebase';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-with-dock',
  templateUrl: './with-dock.component.html',
  styleUrls: ['./with-dock.component.scss']
})
export class WithDockComponent implements OnInit, OnDestroy {

  usersSub: Subscription

  constructor(
    private route: ActivatedRoute,
    private dockIoService: DockIoService,
    private authService: AuthService,
    private userService: UserService) { }

  ngOnInit() {
    this.route.queryParams.subscribe(({ code }) => {
      if (code) {
        this.init(code)
      } else {
        // TODO show or redirect to error
      }
    })
  }

  ngOnDestroy() {
    if (this.usersSub) {
      this.usersSub.unsubscribe()
    }
  }

  async init(code: string) {
    this.usersSub = this.userService.usersCollectionRef.stateChanges(['added'])
      .subscribe(action => {
        action.forEach(({ payload }) => {
          const snapshot = payload.doc
          const data = snapshot.data()
          if (data['@context'] === 'https://dock.io') {
            console.log(data)
            // TODO call firebase function to get a firebase token an log the user in
          }
        })
      })
    // this.dockIoService.callAuthenticationService(code)
  }
}
