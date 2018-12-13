import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';

@Injectable()
export class DockIoService {

  authCollection: AngularFirestoreCollection<any>;
  localStorageObjName = 'dockAuth';

  constructor(
    private http: HttpClient,
    private afs: AngularFirestore) {
    this.authCollection = this.afs.collection<any>('dock-auth');
    this.storeDockAuth({});
  }

  get oAuthURI() {
    const base = environment.dockio.oAuthURI;
    let params = new HttpParams();
    params = params.set('client_id', environment.dockio.account.clientID);
    params = params.set('redirect_uri', environment.dockio.oAuthRedirect);
    params = params.set('response_type', 'code');
    params = params.set('scope', environment.dockio.scope);
    return `${base}?${params.toString()}`;
  }

  getAccessTokenURI(code: string) {
    const base = `${environment.dockio.client.accessTokenURI}/request-user-data`;
    let params = new HttpParams();
    params = params.set('grant_type', 'authorization_code');
    params = params.set('code', code);
    params = params.set('client_id', environment.dockio.account.clientID);
    params = params.set('client_secret', environment.dockio.account.clientSecret);
    return `${base}?${params.toString()}`;
  }

  storeDockAuth(data) {
    localStorage.setItem(this.localStorageObjName, JSON.stringify(data));
  }

  getLocalDockAuthData() {
    const dockAuth = localStorage.getItem(this.localStorageObjName);
    return JSON.parse(dockAuth);
  }

  callAuthenticationService(code: string) {
    const _headers = {
      'Authorization': `Bearer: ${window.sessionStorage.accessToken}`
    };
    this.http.get(this.getAccessTokenURI(code), {
      headers: new HttpHeaders(_headers)
    }).toPromise()
      .then((data: any) => {
        console.log(data);
      }).catch(error => console.error(error));
  }
}
