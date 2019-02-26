import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { environment } from '@env/environment';


const apiUrl = environment.limepay.uri;

const httpOptions = {
  headers: new Headers({
    'Content-Type': 'application/json'
  })
};


@Injectable({
  providedIn: 'root'
})
export class LimepayService {

  constructor(private http: Http) { }

  async getWallet() {
    try {
      const res = await this.http.get(`${apiUrl}/getWallet`, httpOptions).take(1).toPromise();
      return Promise.resolve(res.json());
    } catch (e) {
      return Promise.reject(e);
    }
  }
}
