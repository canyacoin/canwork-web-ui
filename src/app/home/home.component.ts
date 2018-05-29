import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { UserService } from '../user.service';
import { AnimationsService } from '../animations.service';
import { FeedService } from '../feed.service';

import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';

import * as findIndex from 'lodash/findIndex';
import { take } from 'rxjs/operator/take';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {

  currentUser: any = JSON.parse(localStorage.getItem('credentials'));

  query = '';

  startAt = new Subject();
  endAt = new Subject();
  startObs = this.startAt.asObservable();
  endObs = this.endAt.asObservable();

  users: any = [];
  allUsers: any = [];
  gradients: any = [];
  feed: any = [];

  loading = true;
  searching = false;
  filter = false;

  randomAnimation = (Math.random() > 0.5) ? 1 : 0;
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
      // this.loadHandAnimation();
    });

    this.activatedRoute.url.subscribe((url) => {
      console.log('activatedRoute - change', url);
      this.animationsService.loadAnimations();
      this.loadSlides();
      this.checkUserState();
    });
    // this.userService.checkDBState().then( (dbState: any) => {
    //   if ( dbState && dbState.dbLoaded ) {
    //     const state = this.userService.db.get('state');
    //     console.log('HomeComponent - state', this.userService.db, state);
    //     if (!state || state !== 'Done' ) {
    //       this.router.navigate(['/bot']);
    //     }
    //   }
    // });

    // const state = localStorage.getItem('state');
    // if (!state || state !== 'Done' ) {
    //   this.router.navigate(['/bot']);
    // }
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
    // this.afs.collection('users').valueChanges().subscribe( (data: any) => {
    //   this.users = data;
    //   console.log('users', this.users);
    // });
    this.getAllUsers().subscribe((data: any) => {
      for (let i = 0; i < data.length; i++) {
        data[i]['gradient'] = this.randomGradient(data[i].colors);
      }
      // console.log('loadUsers - getAllUsers', data);
      this.allUsers = data;
      this.onSearch();
    });

    // Observable.combineLatest( this.startObs, this.endObs ).subscribe( (terms: any) => {
    //   this.fireQuery( terms[0], terms[1] ).subscribe( (data) => {
    //     this.users = data;
    //   });
    // });
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

  loadHandAnimation() {
    setTimeout(() => {
      if (document.getElementById('hand')) {
        const handData = {
          wrapper: document.getElementById('hand'),
          animType: 'html',
          loop: true,
          prerender: true,
          autoplay: true,
          path: 'assets/data/hand.json',
          rendererSettings: {
            progressiveLoad: false
          }
        };
        const handAnim = (<any>window).bodymovin.loadAnimation(handData);
        handAnim.setSpeed(0.75);
      }
    }, 800);
  }

  onSearch() {
    this.loading = false;
    console.log('onSearch', this.query === '' ? 'Empty' : this.query);
    if (this.query !== '') {
      this.searching = true;
      // this.startAt.next(this.query);
      // this.endAt.next(this.query);
      // + '\uf8ff'

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

      this.users = tmpUsers;
    } else {
      this.searching = false;
      console.log('onSearch - allUsers', this.allUsers);
      this.users = this.allUsers;
    }
  }

  // fireQuery(start, end) {
  //   return this.afs.collection('users', ref => ref.limit(10).orderBy('timestamp').startAt(start).endAt(end)).valueChanges();
  // }

  getAllUsers() {
    return this.afs.collection('users', ref => ref.where('state', '==', 'Done').where('type', '==', 'Provider').orderBy('timestamp', 'desc')).valueChanges();
  }
}
