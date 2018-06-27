import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore, QueryFn } from 'angularfire2/firestore';

import { FirebaseUISignInSuccess } from 'firebaseui-angular';
import { User } from '../../core-classes/user';
import { AuthService } from '../../core-services/auth.service';
import { ScriptService } from '../../core-services/script.service';
import { UserService } from '../../core-services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, AfterViewInit {

  loading = false;
  pageInit = false;

  isOnMobile = false;

  constructor(private router: Router, private authService: AuthService, private userService: UserService,
    private afs: AngularFirestore, private script: ScriptService) {
    this.script.load('uport').then(data => {
      this.pageInit = true;
      this.authService.initUport();
    }).catch(error => {
      this.pageInit = true;
    });
  }

  ngOnInit() {
    const ua = window.navigator.userAgent;
    this.isOnMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua);
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
    // let x: QueryFn = null;
    // if (userDetails.email && userDetails.email !== 'Empty' && userDetails.email !== '') {
    //   x = ref => ref.where('email', '==', userDetails.email).limit(1);
    // }
    this.afs.collection<any>('users', ref => ref.where('address', '==', userDetails.address).limit(1)).valueChanges().take(1).subscribe((usersMatchingId: any) => {
      if (usersMatchingId && usersMatchingId.length > 0) {
        this.authService.setUser(usersMatchingId[0]);
        this.router.navigate(['/home']); // TODO: Add returnURl for when routed here from redirect
        // } else if (x != null) {
        //   this.afs.collection<any>('users', x).valueChanges().take(1).subscribe((usersMatchingEmail: any) => {
        //     if (usersMatchingEmail && usersMatchingEmail.length > 0) {
        //       this.authService.setUser(usersMatchingEmail[0]);
        //       this.router.navigate(['/home']);
        //     } else {
        //       this.initialiseUserAndRedirect(userDetails);
        //     }
        //   });
      } else {
        this.initialiseUserAndRedirect(userDetails);
      }
    });
  }

  async initialiseUserAndRedirect(user: User) {
    this.userService.saveUser(user).then((res) => {
      this.authService.setUser(user);
      this.router.navigate(['/profile/setup']);
    }, (err) => {
      console.log('onLogin - err', err);
    });
  }
}
