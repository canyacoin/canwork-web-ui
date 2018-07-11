import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Headers, Http, RequestOptions, Response } from '@angular/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from 'angularfire2/firestore';

import * as decode from 'jwt-decode';

import * as firebase from 'firebase';
import { FirebaseUISignInSuccess } from 'firebaseui-angular';
import { environment } from '../../../environments/environment';
import { User } from '../../core-classes/user';
import { AuthService } from '../../core-services/auth.service';
import { CanWorkEthService } from '../../core-services/eth.service';
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
  returnUrl: string;
  isOnMobile = false;
  webViewEthAddress: string;
  mobileLoginState: string = '';
  pinDeliveredTo: string;
  httpHeaders = new Headers({ 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });

  constructor(private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private afs: AngularFirestore,
    private http: Http,
    private ethService: CanWorkEthService,
    private script: ScriptService) {
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
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    if (this.isOnMobile) {
      this.setWeb3EthereumPublicAddress();
    }
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

  private setWeb3EthereumPublicAddress() {
    this.ethService.account$.subscribe(async (address: string) => {
      if (address !== undefined) {
        this.webViewEthAddress = address;
      }
    });
  }

  async generateAuthPinCodeAsync() {
    if (this.webViewEthAddress) {
      const reqBody = { ethAddress: this.webViewEthAddress };
      const reqOptions = { headers: this.httpHeaders };
      let response;
      const endPoint = `${environment.backendURI}/generateAuthPinCode`;
      try {
        this.mobileLoginState = 'sending-pin';
        response = await this.http.post(endPoint, reqBody, reqOptions);
      } catch (error) {
        console.error(`! http post error for generating pin at endpoint: ${endPoint}`, error);
      }
      response.subscribe(data => {
        this.mobileLoginState = 'sending-pin-success';
        console.log('+ data!!', data);
        this.pinDeliveredTo = data.json().email;
        console.log('+ generated pin OK');
      }, error => {
        this.mobileLoginState = 'sending-pin-failed';
        console.error('! failed to generate and send auth pin', error);
      });
    }
  }

  async ethereumAuthViaPinCodeAsync(authPin) {
    const pin = authPin.value;
    if (this.webViewEthAddress) {
      console.log('+ auth pin:', pin);
      const reqBody = { ethAddress: this.webViewEthAddress, pin: parseInt(pin, 10) };
      const reqOptions = { headers: this.httpHeaders };
      let response;
      const endPoint = `${environment.backendURI}/ethereumAuthViaPinCode`;
      try {
        this.mobileLoginState = 'authentication-via-pin';
        response = await this.http.post(endPoint, reqBody, reqOptions);
      } catch (error) {
        console.error(`! http post error pin authentication at endpoint: ${endPoint}`, error);
      }
      response.subscribe(async data => {
        this.mobileLoginState = 'authentication-pin-success';
        console.log('+ auth data !!', data);
        const token = data.json().token;
        console.log('+ authenticated via pin OK', token);

        firebase.auth().signInWithCustomToken(token).catch((error) => {
          console.log("firebase.auth().signInWithCustomToken() Error: ", error);
        });

        const tokenPayload = decode(token);
        console.log('+ decoded JWT:', tokenPayload);
        const user: User = new User({ address: tokenPayload.uid })
        this.handleLogin(user);
      }, error => {
        console.log('+ auth status !!', error.status);
        this.mobileLoginState = '';
        switch (error.status) {
          case 403: {
            alert('Permission denied, incorrect credentials');
            break;
          }
          case 401: {
            alert('Permission denied, your PIN code has expired');
            break;
          }
          default: {
            alert('Sorry, we encountered an unknown error');
            console.error(error);
            break;
          }
        }
        this.mobileLoginState = 'authentication-pin-failed';
      });
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
        this.router.navigate([this.returnUrl]);

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
