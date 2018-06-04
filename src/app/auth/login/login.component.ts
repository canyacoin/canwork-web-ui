import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { AngularFirestore } from 'angularfire2/firestore';
import { FirebaseUISignInSuccess } from 'firebaseui-angular';

import { AuthService } from '../../core-services/auth.service';
import { ScriptService } from '../../core-services/script.service';
import { User } from '../../core-classes/user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, AfterViewInit {

  currentUser: User = JSON.parse(localStorage.getItem('credentials'));

  loading = false;
  pageInit = false;

  constructor(private router: Router,
    private authService: AuthService,
    private afs: AngularFirestore,
    private script: ScriptService) {
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

  async saveDetailsAndRedirect(credentials: any) {
    if (credentials && credentials.address) {
      this.router.navigate(['/home']);
    }
  }

  onConnect() {
    try {
      this.loading = true;
      this.authService.uportConnectAsync().then((credentials) => {
        this.saveDetailsAndRedirect(credentials);
      }, (err) => {
        this.loading = false;
        console.log('onConnect - err', err);
      });
    } catch (error) {
      this.loading = false;
      console.log('onConnect - error', error);
    }
  }

  onLogin(signInSuccessData: FirebaseUISignInSuccess) {
    try {
      console.log('onLogin - signInSuccessData', signInSuccessData);
      (<any>window).$('#alternativeLoginModal').modal('hide');

      const rnd = Math.floor(Math.random() * 109) + 1;
      const tmpCredentials = new User({
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
      const options = !signInSuccessData['credential'] && signInSuccessData['currentUser']['phoneNumber'] ?
        { field: 'phone', value: tmpCredentials['phone'] } : { field: 'email', value: tmpCredentials['email'] };

      this.afs.collection<any>('users', ref => ref.where(options.field, '==', options.value).limit(1)).valueChanges().take(1).subscribe((data: any) => {

        if (data && (data instanceof Array) && data.length > 0) {
          localStorage.setItem('credentials', JSON.stringify(data[0]));
          this.saveDetailsAndRedirect(data[0]);
        } else {

          this.authService.initialiseUser(tmpCredentials).then((credentials) => {
            this.saveDetailsAndRedirect(credentials);
          }, (err) => {
            console.log('onLogin - err', err);
          });
        }
      });
    } catch (error) {
      console.log('onLogin - error', error);
    }
  }
}
