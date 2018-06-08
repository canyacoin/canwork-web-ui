import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from 'angularfire2/firestore';

import { FirebaseUISignInSuccess } from 'firebaseui-angular';
import { User } from '../../core-classes/user';
import { AuthService } from '../../core-services/auth.service';
import { ScriptService } from '../../core-services/script.service';

enum LoginType {
  Uport = 'uport',
  Firebase = 'firebase'
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, AfterViewInit {

  currentUser: User = JSON.parse(localStorage.getItem('credentials'));

  loading = false;
  pageInit = false;

  constructor(private router: Router, private authService: AuthService, private afs: AngularFirestore, private script: ScriptService) {
    this.script.load('uport').then(data => {
      this.pageInit = true;
      this.authService.initUport();
    }).catch(error => {
      this.pageInit = true;
    });
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
  }

  onUportLogin() {
    try {
      this.loading = true;
      this.authService.uportConnectAsync().then((credentials) => {
        const avatar = credentials['avatar'];
        const randomAvatarUri = `assets/img/animals/${Math.floor(Math.random() * 109) + 1}.png`;
        credentials['avatar'] = { 'uri': avatar ? credentials['avatar']['uri'] || randomAvatarUri : randomAvatarUri };
        const parsedUser = new User(credentials);

        this.handleLogin(parsedUser);
      }, (err) => {
        this.loading = false;
      });
    } catch (error) {
      this.loading = false;
      console.log('onConnect - error', error);
    }
  }

  onFirebaseLogin(signInSuccessData: FirebaseUISignInSuccess) {
    const rnd = Math.floor(Math.random() * 109) + 1;
    const parsedUser = new User({
      '@context': 'http://schema.org',
      '@type': 'Person',
      'name': signInSuccessData['currentUser']['displayName'] || 'Empty',
      'address': signInSuccessData['currentUser']['uid'],
      'avatar': {
        'uri': signInSuccessData['currentUser']['photoURL'] || `assets/img/animals/${rnd}.png`
      },
      'email': signInSuccessData['currentUser']['email'] || 'Empty',
      'phone': signInSuccessData['currentUser']['phoneNumber'] || 'Empty'
    });

    this.handleLogin(parsedUser);
  }

  handleLogin(userDetails: User) {

    const sub = this.afs.collection<any>('users', ref => ref.where('address', '==', userDetails.address).limit(1)).valueChanges().take(1).subscribe((data: any) => {
      if (data && (data instanceof Array) && data.length > 0) {
        localStorage.setItem('credentials', JSON.stringify(data[0]));
        this.router.navigate(['/home']);
      } else {
        this.initialiseUserAndRedirect(userDetails);
      }
      sub.unsubscribe();
    });
  }

  async initialiseUserAndRedirect(user: User) {
    this.authService.initialiseUser(user).then((res) => {
      this.router.navigate(['/profile/setup']);
    }, (err) => {
      console.log('onLogin - err', err);
    });
  }
}
