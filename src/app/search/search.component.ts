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
  categoryFilters = [];
  chosenFilters = [];
  smallCards = false;
  query: string;
  categoryQuery = '';
  hourlyQuery = '';
  loading = true;
  canToUsd: number;
  minValue = 1;
  maxValue = 300;
  options: Options = {
    floor: 1,
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
    private auth: AuthService,
    private router: Router) {
    this.routeSub = this.activatedRoute.queryParams.subscribe((params) => {
      if (this.query === '') {
        this.query = params['query'];
      }
      if (!this.loading) {
        this.rendering = true;
        setTimeout(() => {
          this.rendering = false;
        });
      if (this.containsClass('menu-overlay', 'activate-menu')) {
          this.toggleMenuOverlay();
        }
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
      }
    });
    this.navService.setHideSearchBar(true);
    const canToUsdResp = await this.http.get('https://api.coinmarketcap.com/v2/ticker/2343/?convert=USD').toPromise();
    if (canToUsdResp.ok) {
      this.canToUsd = JSON.parse(canToUsdResp.text())['data']['quotes']['USD']['price'];
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.loading = false;
    }, 400);
  }

  ngOnDestroy() {
    this.navService.setHideSearchBar(false);
    if (this.routeSub) { this.routeSub.unsubscribe(); }
    if (this.portfolioSub) { this.portfolioSub.unsubscribe(); }
  }

  algoliaSearchChanged(query) {
    this.query = String(query);
  }

  isInArray(value, array: any[]) {
    if (array.indexOf(value) > -1 ) {
      return true;
    } else {
      return false;
    }
  }

  getUsdToCan(usd: number): string {
    if (this.canToUsd) {
      return (usd / this.canToUsd).toFixed(2);
    }
    return '-';
  }

  filterArray(array: User[]) {
    const result = [];
    for (let i = 0; i < array.length; i++) {
      const hourlyRate = parseInt(array[i].hourlyRate, 10);
      if ((hourlyRate >= this.minValue) && (hourlyRate <= this.maxValue)) {
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
    if (!this.containsClass(otherDocumentID, 'hide-menu')) {
      this.toggleMenuOverlay();
      this.toggleClass(otherDocumentID, 'hide-menu');
    }
    if (this.containsClass(documentID, 'hide-menu')) {
      this.resetMenus();
      this.toggleClass(documentID, 'hide-menu');
    } else {
      this.resetMenus();
    }
   this.toggleMenuOverlay();
  }

  resetMenus() {
    if ( (this.containsClass('hours-menu', 'hide-menu')) === false ) {
      this.toggleClass('hours-menu', 'hide-menu');
    }
    if ( (this.containsClass('category-menu', 'hide-menu')) === false ) {
      this.toggleClass('category-menu', 'hide-menu');
    }
  }

  containsClass(DocumentID, hiddenClassName) {
     return document.getElementById(DocumentID).classList.contains(hiddenClassName);
  }

  toggleClass(DocumentID, hiddenClassName) {
    document.getElementById(DocumentID).classList.toggle(hiddenClassName);
  }

  toggleMenuOverlay() {
    document.getElementById('menu-overlay').classList.toggle('activate-menu');
  }

  onChooseCategory(categoryName) {
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
  }

  onSetCategories() {
    this.categoryQuery = ' ';
    if (this.categoryFilters.length > 0) {
      for (let i = 0; i < this.categoryFilters.length; i++) {
        this.categoryQuery = this.categoryQuery + 'refinementList%5Bcategory%5D%5B' + i + '%5D=' + encodeURIComponent(UserCategory[this.categoryFilters[i]]) + '&';
      }
      this.toggleMenuOverlay();
      this.router.navigateByUrl('/search?query=' + ( this.getInputQuery() + '&' + this.categoryQuery + this.hourlyQuery));
    } else {
      this.router.navigateByUrl('/search?query=' + ( this.getInputQuery() + '&' + this.hourlyQuery));
    }
  }

  onSetHourlyRate() {
    if (!(this.containsClass('hours-menu', 'hide-menu'))) {
      this.hourlyQuery = 'range%5BhourlyRate%5D=' + this.minValue + '%3A' + this.maxValue;
      this.toggleMenuOverlay();
      this.router.navigateByUrl('/search?query=' + this.getInputQuery() + '&' + this.categoryQuery + this.hourlyQuery);
    }
  }

  getInputQuery() {
    const value = (document.getElementsByClassName('ais-SearchBox-input')[0] as HTMLInputElement).value;
    return value;
  }

  onResetCategories() {
    if (this.categoryFilters.length > 0) {
      this.categoryFilters = [];
      const categoryBtns = document.getElementsByClassName('category-btn');
      for (let i = 0; i < categoryBtns.length; i++) {
        if (categoryBtns[i].classList.contains('chosen')) {
          categoryBtns[i].classList.remove('chosen');
        }
      }
    }
  }

  onResetHourlyRate() {
    this.maxValue = 300;
    this.minValue = 1;
  }
}
