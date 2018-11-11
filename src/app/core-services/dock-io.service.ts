import { Injectable } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@env/environment';

@Injectable()
export class DockIoService {

  constructor(
    private http: HttpClient) { }

  get oAuthURI() {
    const base = environment.dockio.oAuthURI
    let params = new HttpParams()
    params = params.set('client_id', environment.dockio.account.clientID)
    params = params.set('redirect_uri', environment.dockio.oAuthRedirect)
    params = params.set('response_type', 'code')
    params = params.set('scope', environment.dockio.scope)
    return `${base}?${params.toString()}`
  }

  getAccessTokenURI(code: string) {
    const base = `${environment.dockio.client.accessTokenURI}/request-user-data`
    let params = new HttpParams()
    params = params.set('grant_type', 'authorization_code')
    params = params.set('code', code)
    params = params.set('client_id', environment.dockio.account.clientID)
    params = params.set('client_secret', environment.dockio.account.clientSecret)
    return `${base}?${params.toString()}`
  }

  callAuthenticationService(code: string) {
    const _headers = {
      'Authorization': `Bearer: ${window.sessionStorage.accessToken}`
    }
    this.http.get(this.getAccessTokenURI(code), {
      headers: new HttpHeaders(_headers)
    }).subscribe((data) => {
      console.log(data)
    });
  }
}
