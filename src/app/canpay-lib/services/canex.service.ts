import { Location } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import merge from 'lodash.merge';
import { Observable } from 'rxjs';

const DEFAULT_CONFIGS = {
    useTestNet: false
};

export class CanexConfig {
    backendUrl: string;
    backendEthAddress: string;
    bancor: string;
    cmc: string;
    etherscan: string;
    order: string;
}

@Injectable()
export class CanexService {

    constructor(@Inject('Config') private config: any = {}, private http: Http, private loc: Location) {
        this.config = merge(DEFAULT_CONFIGS, config);
    }

    get environment(): CanexConfig {
        if (this.config.useTestNet) {
            return {
                backendUrl: 'https://canpay-backend-dot-staging-can-work.appspot.com',
                backendEthAddress: '0xA766743bD02AA07f5E5a7509F038028E1DEd8186',
                bancor: 'https://api.bancor.network/0.1/currencies/CAN/ticker?fromCurrencyCode=',
                cmc: 'https://api.coinmarketcap.com/v2/ticker/2343/?convert=',
                etherscan: 'https://ropsten.etherscan.io/tx/',
                order: 'http://staging.canexchange.io/#/order/'
            };
        } else {
            return {
                backendUrl: 'https://canexchange-prod-dot-canwork-io.appspot.com/',
                backendEthAddress: '0xf0725197ca2c41e61912d97c91febcee21664f65',
                bancor: 'https://api.bancor.network/0.1/currencies/CAN/ticker?fromCurrencyCode=',
                cmc: 'https://api.coinmarketcap.com/v2/ticker/2343/?convert=',
                etherscan: 'https://etherscan.io/tx/',
                order: 'http://staging.canexchange.io/#/order/'
            };
        }
    }

    // get list of supported erc20 tokens
    getTokensBancor(): Observable<any> {
        return this.http.get(this.environment.backendUrl + '/api/bancor');
    }

    // get conversion rates from coin market cap api
    getDataCmc(currency): Observable<any> {
        return this.http.get(this.environment.cmc + currency);
    }

    // get conversion rates from bancor api
    getData(currency): Observable<any> {
        return this.http.get(this.environment.bancor + currency);
    }

    // get list of tokes
    getTokens(): Observable<any> {
        return this.http.get(this.environment.backendUrl + '/api/getTokens');
    }

    // gets current session
    getSessionId(): Observable<any> {
        return this.http.get(this.environment.backendUrl + '/api/getunique');
    }

    // sends mail request
    sentMail(data: any): Observable<any> {
        return this.http.post(this.environment.backendUrl + '/api/sendMail', data);
    }

    // it checks the status of tx
    checkStatus(id: any): Observable<any> {
        return this.http.get(this.environment.backendUrl + '/api/staging/' + id);
    }

    // save the tx
    save(data: any): Observable<any> {
        return this.http.post(this.environment.backendUrl + '/api/saveTransaction', data);
    }

    // it returns order details provided id
    getOrder(id: any): Observable<any> {
        return this.http.get(this.environment.backendUrl + '/api/order/' + id);
    }


    // get gas price
    getGasPrice(): Observable<any> {
        return this.http.get(this.environment.backendUrl + '/api/getGas');
    }

    // get token by address
    getByAddress(address: string): Observable<any> {
        return this.http.get(this.environment.backendUrl + '/api/getbyaddress/' + address);
    }

    // send staging mail
    sentMailStaging(data: any): Observable<any> {
        return this.http.post(this.environment.backendUrl + '/api/sendStagingMail', data);
    }

    // initiate staging call
    submitPost(data: any): Observable<any> {
        return this.http.post(this.environment.backendUrl + '/api/staging', data);
    }
}
