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

  getLocalConnectionAddress() {
    const dockAuthData = this.getLocalDockAuthData();
    return (dockAuthData.user_data || {}).connection_addr;
  }

  async getDockSchemaByConnectionAddress(address: string) {
    try {
      const querySnapshot = await this.authCollection.ref
        .where('connectionAddress', '==', address)
        .limit(1).get();
      return querySnapshot;
    } catch (error) {
      console.error(error);
    }
  }

  callAuthenticationService(code: string) {
    const _headers = {
      'Authorization': `Bearer: ${window.sessionStorage.accessToken}`
    };
    return this.http.get(this.getAccessTokenURI(code), {
      headers: new HttpHeaders(_headers)
    }).toPromise();
  }
  async getFirebaseToken(userID: string): Promise<string> {
    const reqBody = { userID: userID };
    const reqOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }) };
    let response;
    const endPoint = `${environment.backendURI}/getFirebaseTokenForDockIOAuth`;
    try {
      response = await this.http.post(endPoint, reqBody, reqOptions);
    } catch (error) {
      console.error(`! http post error pin authentication at endpoint: ${endPoint}`, error);
    }
    return new Promise((resolve, reject) => {
      response.subscribe(async data => {
        resolve(data.token);
      }, err => reject(err));
    }) as Promise<string>;
  }
}
