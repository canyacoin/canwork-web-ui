import { WINDOW } from '@ng-toolkit/universal';
import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';

import * as firebase from 'firebase/app';
import { environment } from '@env/environment';
import { ActionType } from '@class/job-action';
import { AuthService } from './auth.service';

// When I grow up, I want to extend a Notification service for the notification delivery implementation

@Injectable()
export class JobNotificationService {

  readonly endPoint: string = `${environment.backendURI}/jobStateEmailNotification`;

  constructor(@Inject(WINDOW) private window: Window, private authService: AuthService, private http: Http) { }

  public async notify(jobAction: ActionType, jobId: string) {

    // TODO: move this into authService.getJwt() and solve async issues
    firebase.auth().onAuthStateChanged(async user => {
      if (user) {
        const token = await user.getIdToken(true);
        const headers = new Headers();
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', `Bearer ${token}`);
        const reqOptions = { headers };
        const reqBody = { jobAction: jobAction.toString(), jobId };

        console.log('+ email notification reqOptions:', reqOptions);
        console.log('+ email notification reqBody:', reqBody);
        let response;
        try {
          response = await this.http.post(this.endPoint, reqBody, { headers });
        } catch (error) {
          console.error(`! http post error sending notification to endpoint: ${this.endPoint}`, error);
        }
        response.subscribe(data => {
          console.log('+ message sent OK');
        }, error => {
          console.log(`+ error: ${error.status} sending notification:`, error);
        });
      } else {
        this.window.sessionStorage.accessToken = '';
      }
    });
  }
}
