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
import { Portfolio, Work } from '../core-classes/portfolio';
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

  @ViewChild('search', { read: ElementRef }) search: ElementRef;

  constructor(private activatedRoute: ActivatedRoute, private navService: NavService,
    private afs: AngularFirestore, private http: Http, private cdRef: ChangeDetectorRef) {
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
    this.navService.setHideSearchBar(true);
    const canToUsdResp = await this.http.get('https://api.coinmarketcap.com/v2/ticker/2343/?convert=USD').toPromise();
    if (canToUsdResp.ok) {
      this.canToUsd = JSON.parse(canToUsdResp.text())['data']['quotes']['USD']['price'];
    }
    document.getElementById('hours-menu').classList.toggle('hide-menu');
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
    console.log(query);
  }

  getUsdToCan(usd: number): string {
    if (this.canToUsd) {
      return (usd / this.canToUsd).toFixed(2);
    }
    return '-';
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

  onChooseCategory(categoryName) {
    // logic : if the category name is already in the array and this method is called again WITH the same name
    // it must be removed. see the front end, and you'll get it.
    const isInArray = this.categoryFilters.find(function (element) {
      return element === categoryName;
    });
    if (typeof isInArray === 'undefined') {
      this.categoryFilters.push(categoryName);
    } else {
      const index = this.categoryFilters.findIndex(function (element) {
        return element === categoryName;
      })
      this.categoryFilters.splice(index, 1);
    }
    document.getElementById(categoryName).classList.toggle('chosen');
    console.log(this.categoryFilters);
  }

  onSetHourlyRate() {
    console.log(this.maxValue, this.minValue);
  }

  onResetHourlyRate() {
    this.maxValue = 300;
    this.minValue = 0;
  }
}
