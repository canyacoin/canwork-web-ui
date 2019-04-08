import { UserService } from '@service/user.service';
import { AuthService } from '@service/auth.service';
import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { environment } from '@env/environment';
import LimePayWeb from 'limepay-web';

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
    private auth: AuthService,
    private userService: UserService,
  ) {
    LimePayWeb.connect(LimePayWeb.Environment[environment.limepay.env]).then(limepay => {
      this.limepay = limepay;
    }).catch(e => {
      console.log(e);
    });
  }

  get library() {
    return this.limepay;
  }

  async getOptions() {
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
      const res = await this.http.get(`${apiUrl}/auth/enter-escrow-tx?jobId=${jobId}`, await this.getOptions()).take(1).toPromise();
      return Promise.resolve(res.json());
    } catch (e) {
      console.log(`Error in getEnterEscrowTransactions: `, e);
      return Promise.reject(e);
    }
  }

  async getPaymentStatus(paymentId): Promise<any> {
    try {
      const res = await this.http.get(`${apiUrl}/auth/get-payment-status?paymentId=${paymentId}`, await this.getOptions()).take(1).toPromise();
      return Promise.resolve(res.json());
    } catch (e) {
      console.log(`Error in getPaymentStatus: `, e);
    }
  }

  async monitorPayment(paymentId, jobId): Promise<any> {
    try {
      const res = await this.http.get(`${apiUrl}/auth/monitor?paymentId=${paymentId}&jobId=${jobId}`, await this.getOptions()).take(1).toPromise();
      return Promise.resolve(res.json());
    } catch (e) {
      console.log(`Error in submitting payment for monitoring: `, e);
    }
  }

  async initFiatPayment(jobId, providerId): Promise<any> {
    try {
      const provider = await this.userService.getUser(providerId);
      const res = await this.http.post(`${apiUrl}/auth/initFiatPayment`, { jobId, providerEthAddress: provider.ethAddress }, await this.getOptions()).take(1).toPromise();
      return Promise.resolve(res.json());
    } catch (e) {
      console.log(`Error in initFiatPayment: `, e);
      return Promise.reject(e);
    }
  }

  async initRelayedPayment(jobId, userId): Promise<any> {
    try {
      const res = await this.http.post(`${apiUrl}/auth/initRelayedPayment`, { jobId, userId }, await this.getOptions()).take(1).toPromise();
      return Promise.resolve(res.json());
    } catch (e) {
      console.log(`Error in initRelayedPayment: `, e);
      return Promise.reject(e);
    }
  }

  async createShopper() {
    try {
      const res = await this.http.post(`${apiUrl}/auth/createShopper`, {}, await this.getOptions()).take(1).toPromise();
      console.log(res);
      return Promise.resolve(res.json());
    } catch (e) {
      console.log(`Error in createShopper: `, e);
      return Promise.reject(e);
    }
  }

  async getShopper() {
    try {
      const res = await this.http.get(`${apiUrl}/auth/getShopper`, await this.getOptions()).take(1).toPromise();
      console.log(res);
      return Promise.resolve(res.json());
    } catch (e) {
      console.log(`Error in getShopper: `, e);
      return Promise.reject(e);
    }
  }

  async getWallet() {
    try {
      const walletToken = await this.getWalletToken();
      const wallet = await this.library.Wallet.get(walletToken);
      return Promise.resolve(wallet);
    } catch (e) {
      console.log(`Error in getWallet: `, e);
      return Promise.reject(e);
    }
  }


  async createWallet(password) {
    try {
      const walletToken = await this.getWalletToken();
      console.log(`Wallet token: `, walletToken);
      const mnemonic = await this.library.Wallet.create(walletToken, password);
      const result = { walletToken, mnemonic };
      return Promise.resolve(result);
    } catch (e) {
      console.log(`Error in createWallet: `, e);
      return Promise.reject(e);
    }
  }

  async getWalletToken() {
    try {
      const res = await this.http.get(`${apiUrl}/auth/getWalletToken`, await this.getOptions()).take(1).toPromise();
      return Promise.resolve(res.json().walletToken);
    } catch (e) {
      console.log(`Error in getWalletToken: `, e);
      return Promise.reject(e);
    }
  }
}
