import {
  AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild
} from '@angular/core';
import { Http, Response } from '@angular/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import * as findIndex from 'lodash/findIndex';
import * as orderBy from 'lodash/orderBy';
import * as union from 'lodash/union';
import { Observable } from 'rxjs/Observable';
import { take } from 'rxjs/operator/take';
import { Subscription } from 'rxjs/Subscription';
import { Options, LabelType } from 'ng5-slider';
import { environment } from '../../environments/environment';
import { UserService } from '../core-services/user.service';
import { AuthService } from '../core-services/auth.service';
import { User, UserCategory } from '../core-classes/user';
import { NavService } from '../core-services/nav.service';
import { UserType } from '../../../functions/src/user-type';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit, AfterViewInit, OnDestroy {

  allProviders: User[] = [];
  filteredProviders: User[] = [];
  categoryFilters: UserType[] = [];
  smallCards = false;
  query = '';
  loading = true;
  canToUsd: number;
  minValue = 0;
  maxValue = 300;
  options: Options = {
    floor: 0,
    ceil: 300,
    translate: (value: number, label: LabelType): string => {
      switch (label) {
        case LabelType.Low:
          return '<b>Min price:</b> $' + value;
        case LabelType.High:
          return '<b>Max price:</b> $' + value;
        default:
          return '$' + value;
      }
    }
  };
  routeSub: Subscription;
  providerSub: Subscription;
  portfolioSub: Subscription;
  algoliaIndex = environment.algolia.indexName;
  rendering = false;
  inMyTimezone = true;
  algoliaSearchConfig: any;
  private authSub;
  currentUser;
  @ViewChild('search', { read: ElementRef }) search: ElementRef;

  constructor(private activatedRoute: ActivatedRoute, private navService: NavService,
    private afs: AngularFirestore, private http: Http, private userService: UserService, 
    private auth: AuthService) {
    this.routeSub = this.activatedRoute.queryParams.subscribe((params) => {
      this.query = params['query'] ? params['query'] : '';
      if (!this.loading) {
        this.rendering = true;
        setTimeout(() => {
          this.rendering = false;
        });
      }
    });
  }

  async ngOnInit() {
    this.algoliaSearchConfig = {
      ...environment.algolia,
      indexName: this.algoliaIndex,
      routing: true
    };

    this.authSub = this.auth.currentUser$.subscribe((user: User) => {
      if (this.currentUser !== user) {
        this.currentUser = user;
        console.log(this.currentUser.timezone);
      }
    });

    this.navService.setHideSearchBar(true);
    const canToUsdResp = await this.http.get('https://api.coinmarketcap.com/v2/ticker/2343/?convert=USD').toPromise();
    if (canToUsdResp.ok) {
      this.canToUsd = JSON.parse(canToUsdResp.text())['data']['quotes']['USD']['price'];
    }
    // document.getElementById('hours-menu').classList.toggle('hide-menu');
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.loading = false;
    }, 400);
    this.search.nativeElement.querySelector('.ais-SearchBox-submit').innerHTML = '<img src="assets/img/search-icon-white.svg" class="searchbar-searchicon">';
  }

  ngOnDestroy() {
    this.navService.setHideSearchBar(false);
    if (this.routeSub) { this.routeSub.unsubscribe(); }
    if (this.portfolioSub) { this.portfolioSub.unsubscribe(); }
  }

  algoliaSearchChanged(query) {
  }

  getUsdToCan(usd: number): string {
    if (this.canToUsd) {
      return (usd / this.canToUsd).toFixed(2);
    }
    return '-';
  }

  filterArray(array: User[]) {
    const result = [];
    for (let i = 0; i < array.length ; i++) {
      const hourlyRate = parseInt(array[i].hourlyRate, 10);
      if ( ( hourlyRate >= this.minValue) && (hourlyRate <= this.maxValue) ) {
        result.push(array[i]);
      }
    }
    return result;
  }
  setSmallCards(bool: boolean) {
    this.smallCards = bool;
  }

  getProviderTags(provider: any): string[] {
    const allTags: string[] = union(provider.skillTags === undefined ? [] : provider.skillTags, provider.workSkillTags === undefined ? [] : provider.workSkillTags);
    if (allTags.length > 5) {
      const moreSymbol = ('+ ' + (allTags.length - 5) + ' more');
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

  toggleOverlay(documentID, otherDocumentID, buttonID) {
    if (!(document.getElementById(otherDocumentID).classList.contains('hide-menu'))) {
      document.getElementById('menu-overlay').classList.toggle('activate-menu');
      document.getElementById(otherDocumentID).classList.toggle('hide-menu');
    }
    if (document.getElementById(documentID).classList.contains('hide-menu')) {
      this.resetMenus();
      document.getElementById(documentID).classList.toggle('hide-menu');
    } else {
      this.resetMenus();
    }
    document.getElementById('menu-overlay').classList.toggle('activate-menu');
  }

  resetMenus() {
    if (document.getElementById('hours-menu').classList.contains('hide-menu') === false) {
      document.getElementById('hours-menu').classList.toggle('hide-menu');
    }
    if (document.getElementById('category-menu').classList.contains('hide-menu') === false) {
      document.getElementById('category-menu').classList.toggle('hide-menu');
    }
  }

  onSetHourlyRate() {
    console.log(this.maxValue, this.minValue);
    const algoliaMinInput = document.getElementsByClassName('ais-RangeInput-input--min');
    for ( let i = 0 ; i < algoliaMinInput.length ; i++) {
      (<HTMLInputElement>algoliaMinInput[i]).value = String(this.minValue);
    }
    const algoliaMaxInput = document.getElementsByClassName('ais-RangeInput-input--max');
    for ( let i = 0 ; i < algoliaMaxInput.length ; i++) {
      (<HTMLInputElement>algoliaMaxInput[i]).value = String(this.maxValue);
    }
    const algoliaFilterButton = document.getElementsByClassName('ais-RangeInput-submit');
    for ( let i = 0 ; i < algoliaFilterButton.length ; i++) {
      (<HTMLInputElement>algoliaFilterButton[i]).click();
    }
  }

  onResetHourlyRate() {
    this.maxValue = 300;
    this.minValue = 0;
  }
}
