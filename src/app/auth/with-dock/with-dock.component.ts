import { Component, OnDestroy, OnInit } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '@class/user';
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
        action.forEach(({ payload }) => {
          const snapshot = payload.doc;
          const data = snapshot.data();
          const isFromDockContext = data['redirectURIAuthCode'] && data['userID'] ? true : false;
          const remoteAuthCodeMatchesLocalCode = data['redirectURIAuthCode'] === code;
          if (isFromDockContext && remoteAuthCodeMatchesLocalCode) {
            console.log(data);
            this.getFirebaseToken(data.userID);
          }
        });
      });
    this.dockIoService.storeDockAuth({
      redirectURIAuthCode: code,
    });
    this.dockIoService.callAuthenticationService(code);
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
      await firebase.auth().signInWithCustomToken(token).catch((error) => {
        console.log('firebase.auth().signInWithCustomToken() Error: ', error);
      });
      const tokenPayload = decode(token);
      console.log('+ decoded JWT:', tokenPayload);
      const user: User = new User({
        address: tokenPayload.uid,
        isDockUpdating: false,
      });
      this.handleLogin(user);
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

  async handleLogin(user: User) {
    firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then(idToken => {
      window.sessionStorage.accessToken = idToken;
      this.initialiseUserAndRedirect(user);
    }).catch(error => {
      console.error('! jwt token was not stored in session storage ', error);
      alert('Sorry, we encountered an unknown error');
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
