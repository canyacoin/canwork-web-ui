import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Http, Response } from '@angular/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import * as findIndex from 'lodash/findIndex';
import * as orderBy from 'lodash/orderBy';
import * as union from 'lodash/union';
import { Observable } from 'rxjs/Observable';
import { take } from 'rxjs/operator/take';
import { Subscription } from 'rxjs/Subscription';

import { environment } from '../../environments/environment';
import { Portfolio, Work } from '../core-classes/portfolio';
import { User } from '../core-classes/user';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  allProviders: User[] = [];
  filteredProviders: User[] = [];

  query = '';
  loading = true;
  canToUsd: number;

  routeSub: Subscription;
  providerSub: Subscription;
  portfolioSub: Subscription;

  algoliaSearchConfig = {
    ...environment.algolia,
    indexName: environment.algolia.indexName,
    routing: true
  };

  constructor(private activatedRoute: ActivatedRoute,
    private afs: AngularFirestore, private http: Http) {
    this.routeSub = this.activatedRoute.params.subscribe((params) => {
      this.query = params['query'] ? params['query'] : '';
    });
  }

  async ngOnInit() {
    const canToUsdResp = await this.http.get('https://min-api.cryptocompare.com/data/price?fsym=CAN&tsyms=AUD').toPromise();
    if (canToUsdResp.ok) {
      this.canToUsd = JSON.parse(canToUsdResp.text())['AUD'];
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.loading = false;
    }, 400);
  }

  ngOnDestroy() {
    if (this.routeSub) { this.routeSub.unsubscribe(); }
    if (this.portfolioSub) { this.portfolioSub.unsubscribe(); }
  }

  algoliaSearchChanged(query) {
    // (query.length) ? this.algoliaShowResults = true : this.algoliaShowResults = false;
  }

  getUsdToCan(usd: number): string {
    if (this.canToUsd) {
      return (usd / this.canToUsd).toFixed(2);
    }
    return '-';
  }

  getProviderTags(provider: any): string[] {
    const allTags: string[] = union(provider.skillTags === undefined ? [] : provider.skillTags, provider.workSkillTags === undefined ? [] : provider.workSkillTags);
    if (allTags.length > 6) {
      const moreSymbol = ('+ ' + (allTags.length - 6) + ' more');
      const arr = allTags.slice(0, 5);
      return arr.concat([moreSymbol]);
    }
    return allTags;
  }

  getRandomGradient(colors: any): string {
    if (!(colors instanceof Array)) {
      colors = ['#00FFCC', '#33ccff', '#15EDD8'];
    }

    const tmp: any = [
      `linear-gradient(122deg, ${colors[0]} 0%, ${colors[1]} 93%)`,
      `linear-gradient(110deg, ${colors[0]} 60%, ${colors[1]} 60%)`,
      `linear-gradient(70deg, ${colors[0]} 40%, ${colors[1]} 40%)`,
      `linear-gradient(110deg, ${colors[0]} 40%, rgba(0, 0, 0, 0) 30%), radial-gradient(farthest-corner at 0% 0%, ${colors[1]} 70%, ${colors[2]} 70%)`,
      `linear-gradient(70deg, ${colors[0]} 30%, rgba(0,0,0,0) 30%), linear-gradient(30deg, ${colors[1]} 60%, ${colors[2]} 60%)`
    ];
    return tmp[Math.floor(Math.random() * (tmp.length - 1))];
  }

}
