import { AuthService } from '@service/auth.service';
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

  private limepay;

  constructor(
    private http: Http,
    private auth: AuthService
  ) {
    LimePayWeb.connect(environment.limepay.env).then(limepay => {
      this.limepay = limepay;
    }).catch(e => {
      console.log(e);
    });
  }

  get library() {
    return this.limepay;
  }

  async get options() {
    try {
      const token = await this.auth.getJwt();
      const options = {
        headers: new Headers({
          'Content-Type': 'application/json',
          'Authorization': 'bearer ' + token
        })
      };
      return Promise.resolve(options);
    } catch (e) {
      console.log(`Error in options: `, e);
      return Promise.reject(e);
    }
  }

  async getEnterEscrowTransactions(jobId): Promise<any> {
    try {
      const res = await this.http.get(`${apiUrl}/auth/enter-escrow-tx?jobId=${jobId}`, await this.options).take(1).toPromise();
    } catch (e) {
      console.log(`Error in getEnterEscrowTransactions: `, e);
      return Promise.reject(e);
    }
  }

  async initFiatPayment(jobId, providerEthAddress): Promise<any> {
    try {
      const res = await this.http.post(`${apiUrl}/auth/fiatpayment`, { jobId , providerEthAddress } , await this.options).take(1).toPromise();
    } catch (e) {
      console.log(`Error in initFiatPayment: `, e);
      return Promise.reject(e);
    }
  }

  async createShopper(userId) {
    try {
      const res = await this.http.post(`${apiUrl}/auth/createShopper`, {}, await this.options).take(1).toPromise();
      console.log(res);
      return Promise.resolve(res.json());
    } catch (e) {
      console.log(`Error in createShopper: `, e);
      return Promise.reject(e);
    }
  }

  async getShopper(userId) {
    try {
      const res = await this.http.get(`${apiUrl}/auth/getShopper`, await this.options).take(1).toPromise();
      console.log(res);
      return Promise.resolve(res.json());
    } catch (e) {
      console.log(`Error in getShopper: `, e);
      return Promise.reject(e);
    }
  }

  async getWallet() {
    try {
      const res = await this.http.get(`${apiUrl}/auth/getWalletToken`, await this.options).take(1).toPromise();
      console.log(`Wallet token: ${res.json()}`);
      const wallet = await this.library.Wallet.get(res.json());
      return Promise.resolve(wallet);
    } catch (e) {
      console.log(`Error in getWallet: `, e);
      return Promise.reject(e);
    }
  }

  async createWallet(password) {
    try {
      const res = await this.http.get(`${apiUrl}/auth/getWalletToken`, await this.options).take(1).toPromise();
      console.log(`Wallet token: `, res.json());
      const mnemonic = await this.library.Wallet.create(res.json(), password);
      const wallet = await this.library.Wallet.get(res.json());
      console.log(`Wallet: `, wallet);
      return Promise.resolve(wallet);
    } catch (e) {
      console.log(`Error in createWallet: `, e);
      return Promise.reject(e);
    }
  }
}
