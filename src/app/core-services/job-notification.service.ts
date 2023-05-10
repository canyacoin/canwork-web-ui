import { Injectable } from '@angular/core'
import { HttpHeaders, HttpClient, HttpResponse } from '@angular/common/http'

import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

import { environment } from '@env/environment'
import { ActionType } from '@class/job-action'
import { AuthService } from './auth.service'

// When I grow up, I want to extend a Notification service for the notification delivery implementation

@Injectable()
export class JobNotificationService {
  readonly endPoint: string = `${environment.backendURI}/jobStateEmailNotification`

  constructor(private authService: AuthService, private http: HttpClient) {}

  public async notify(jobAction: ActionType, jobId: string) {
    // TODO: move this into authService.getJwt() and solve async issues
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        const token = await user.getIdToken(true)
        let headers = new HttpHeaders()
        headers = headers.append('Access-Control-Allow-Origin', '*')
        headers = headers.append('Content-Type', 'application/json')
        headers = headers.append('Authorization', `Bearer ${token}`)

        const reqBody = { jobAction: jobAction.toString(), jobId }

        let response
        try {
          response = await this.http.post(this.endPoint, reqBody, { headers })
        } catch (error) {
          console.error(
            `! http post error sending notification to endpoint: ${this.endPoint}`,
            error
          )
        }
        response.subscribe(
          (data) => {
            console.log('+ message sent OK')
          },
          (error) => {
            console.log(`+ error: ${error.status} sending notification:`, error)
          }
        )
      } else {
        window.sessionStorage.accessToken = ''
      }
    })
  }
}
