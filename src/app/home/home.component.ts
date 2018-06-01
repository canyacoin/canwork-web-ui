import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { UserService } from '../user.service';
import { FeedService } from '../feed.service';

import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { take } from 'rxjs/operator/take';
import 'rxjs/add/observable/combineLatest';

import * as findIndex from 'lodash/findIndex';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {

  currentUser: any = JSON.parse(localStorage.getItem('credentials'));

  query = '';

  users: any = [];
  allUsers: any = [];
  feed: any = [];

  loading = true;
  searching = false;
  filter = false;

  placeholder = 'assets/img/outandabout.png';

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private animationsService: AnimationsService,
    private feedService: FeedService,
    private afs: AngularFirestore) {

  }

  ngOnInit() {
    this.feedService.getItems().subscribe((result: any) => {
      result.subscribe((data) => {
        data.slice(0, 3).map((item) => {
          this.feed.push(item);
        });
      });
    });
  }

  ngAfterViewInit() {
    this.activatedRoute.params.subscribe((params) => {
      this.query = params['query'] ? params['query'] : '';
      console.log('ngAfterViewInit', this.query === '' ? 'Empty' : this.query);
      this.loadUsers();
    });

    this.activatedRoute.url.subscribe((url) => {
      console.log('activatedRoute - change', url);
      this.animationsService.loadAnimations();
      this.loadSlides();
      this.checkUserState();
    });
  }

  checkUserState() {
    if (this.currentUser && this.currentUser.address) {
      this.afs.collection<any>('users').doc(this.currentUser.address).valueChanges().take(1).subscribe( (user: any) => {
        console.log('ngAfterViewInit - user', user);
        if (!user.type) {
          this.router.navigate(['/wizard']);
        }
      });
    }
  }

  loadSlides() {
    const options = {
      autoplay: 3000,
      speed: 1000,
      loop: true,
      breakpoints: {
        480: {
          slidesPerView: 1
        }
      },
      // pagination: '.swiper-pagination',
      // paginationClickable: true
    };
    if ((<any>window).Swiper) {
      const slides = new (<any>window).Swiper('.swiper-container', options);
    }
  }

  loadUsers() {
    this.getAllUsers().subscribe((data: any) => {
      for (let i = 0; i < data.length; i++) {
        data[i]['gradient'] = this.randomGradient(data[i].colors);
      }
      this.allUsers = data;
      this.onSearch();
    });
  }

  randomGradient(colors: any) {

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

  getAllUsers() {
    return this.afs.collection('users', ref => ref.where('state', '==', 'Done').where('type', '==', 'Provider').orderBy('timestamp', 'desc')).valueChanges();
  }

  onSearch() {
    this.loading = false;
    console.log('onSearch', this.query === '' ? 'Empty' : this.query);
    if (this.query !== '') {
      this.searching = true;

      const tmpUsers: any = [];
      this.allUsers.map((item) => {
        if (JSON.stringify(item).toLowerCase().includes(this.query.toLowerCase())) {
          tmpUsers.push(item);
        }
      });

      this.allUsers.map((item) => {
        this.afs.collection(`portfolio/${item.address}/work`).valueChanges().take(1).subscribe((work: any) => {
          if (JSON.stringify(work).toLowerCase().includes(this.query.toLowerCase())) {
            const index: number = findIndex(tmpUsers, { 'address': item.address });
            if (index === -1) {
              tmpUsers.push(item);
            }
          }
        });
      });

      this.searching = false;
      this.users = tmpUsers;
    } else {
      console.log('onSearch - allUsers', this.allUsers);
      this.searching = false;
      this.users = this.allUsers;
    }
  }
}
