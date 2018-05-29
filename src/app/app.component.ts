import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from './user.service';
import { AngularFireAuth } from 'angularfire2/auth';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  currentUser: any = JSON.parse( localStorage.getItem('credentials') );

  constructor(private router: Router,
    private userService: UserService,
    private afAuth: AngularFireAuth) {
  }

  onCancel() {
    // Do nothing
  }

  onLogout() {
    localStorage.clear();
    this.afAuth.auth.signOut();
    this.router.navigate(['login']);
    window.location.reload();
  }
}
