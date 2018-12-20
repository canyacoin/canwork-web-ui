import { Component, OnDestroy, OnInit } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { ActivatedRoute, Router } from '@angular/router';
import { User, UserState } from '@class/user';
import { environment } from '@env/environment';
import { AuthService } from '@service/auth.service';
import { DockIoService } from '@service/dock-io.service';
import { UserService } from '@service/user.service';
import { Subscription } from 'rxjs/Subscription';

import * as decode from 'jwt-decode';

import * as firebase from 'firebase/app';

@Component({
  selector: 'app-with-dock',
  templateUrl: './with-dock.component.html',
  styleUrls: ['./with-dock.component.scss']
})
export class WithDockComponent implements OnInit, OnDestroy {

  dockAuthSub: Subscription;
  httpHeaders = new Headers({ 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: Http,
    private dockIoService: DockIoService,
    private authService: AuthService,
    private userService: UserService) { }

  ngOnInit() {
    this.route.queryParams.subscribe(({ code }) => {
      if (code) {
        this.init(code);
      } else {
        // TODO show or redirect to error
      }
    });
  }

  ngOnDestroy() {
    if (this.dockAuthSub) {
      this.dockAuthSub.unsubscribe();
    }
  }

  async init(code: string) {
    console.log(`Calling dock-io-service with code [${code}]`);
    this.dockAuthSub = this.dockIoService.authCollection.stateChanges(['added', 'modified'])
      .subscribe(action => {
        action.some(({ payload, type }) => {
          const snapshot = payload.doc;
          const data = snapshot.data();
          const isFromDockContext = data['redirectURIAuthCode'] && data['userID'] ? true : false;
          const remoteAuthCodeMatchesLocalCode = data['redirectURIAuthCode'] === code;
          if (isFromDockContext && remoteAuthCodeMatchesLocalCode) {
            console.log(`+ curuser + type: ${type}, `, data);
            this.getFirebaseToken(data.userID);
          }
          return isFromDockContext && remoteAuthCodeMatchesLocalCode;
        });
      });
    this.dockIoService.storeDockAuth({
      redirectURIAuthCode: code,
    });
    try {
      const data = await this.dockIoService.callAuthenticationService(code);
      console.log('+ user data from dock +', data);
      const localDockAuthData = this.dockIoService.getLocalDockAuthData();
      this.dockIoService.storeDockAuth(Object.assign(data, localDockAuthData));
    } catch (error) {
      alert('Sorry, we encountered an unknown error');
      console.error(error);
    }
  }

  async getFirebaseToken(userID: string) {
    const reqBody = { userID: userID };
    const reqOptions = { headers: this.httpHeaders };
    let response;
    const endPoint = `${environment.backendURI}/getFirebaseTokenForDockIOAuth`;
    try {
      response = await this.http.post(endPoint, reqBody, reqOptions);
    } catch (error) {
      console.error(`! http post error pin authentication at endpoint: ${endPoint}`, error);
    }
    response.subscribe(async data => {
      console.log('+ auth data !!', data);
      const token = data.json().token;
      console.log('+ authenticated via pin OK', token);
      const tokenPayload = decode(token);
      console.log('+ decoded JWT:', tokenPayload);
      this.handleLogin(token, tokenPayload.uid);
    }, error => {
      console.log('+ auth status !!', error.status);
      switch (error.status) {
        case 403: {
          alert('Permission denied, incorrect credentials');
          break;
        }
        case 401: {
          alert('Permission denied, your PIN code has expired');
          break;
        }
        case 404: {
          alert('Please sign in via the desktop, and set your ethereum address first');
          break;
        }
        default: {
          alert('Sorry, we encountered an unknown error');
          console.error(error);
          break;
        }
      }
    });
  }

  async handleLogin(token: string, address: string) {
    try {
      const userCredential = await firebase.auth().signInWithCustomToken(token);
      const idToken = await userCredential.user.getIdToken(true);
      window.sessionStorage.accessToken = idToken;
      window.sessionStorage.setItem('uid', address);
    } catch (err) {
      alert('Sorry, we encountered an unknown error');
      console.log(err);
    }
    const user = await this.userService.getUser(address);
    this.initialiseUserAndRedirect(user);
  }

  async initialiseUserAndRedirect(user: User) {
    await this.userService.saveUser(user);
    this.authService.setUser(user);
    if (user.state === UserState.done) {
      this.router.navigate(['/home']);
    } else {
      this.router.navigate(['/profile/setup']);
    }
  }
}
