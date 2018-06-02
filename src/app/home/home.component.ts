import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';

import { Observable } from 'rxjs/Observable';
import { take } from 'rxjs/operator/take';
import { Subscription } from 'rxjs/Subscription';

import * as findIndex from 'lodash/findIndex';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  currentUser: any = JSON.parse(localStorage.getItem('credentials'));

  allProviders: any = [];
  filteredProviders: any = [];

  query = '';
  loading = true;
  searching = false;

  routeSub: Subscription;
  providerSub: Subscription;


  constructor(private activatedRoute: ActivatedRoute,
    private afs: AngularFirestore) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.routeSub = this.activatedRoute.params.subscribe((params) => {
      this.query = params['query'] ? params['query'] : '';
      this.loadProviders();
    });
  }

  ngOnDestroy() {
    if (this.routeSub) { this.routeSub.unsubscribe(); }
    if (this.providerSub) { this.providerSub.unsubscribe(); }
  }

  loadProviders() {
    const providersCollection = this.afs.collection('users', ref => ref.where('state', '==', 'Done').where('type', '==', 'Provider').orderBy('timestamp', 'desc'));
    this.providerSub = providersCollection.valueChanges().subscribe((data: any) => {
      this.allProviders = data;
      this.filterProviders();
    });
  }

  filterProviders() {
    this.loading = false;
    if (this.query !== '') {
      this.searching = true;

      const selectedProviders: any = [];
      this.allProviders.map((item) => {
        if (JSON.stringify(item).toLowerCase().includes(this.query.toLowerCase())) {
          selectedProviders.push(item);
        }
      });

      this.allProviders.map((item) => {
        this.afs.collection(`portfolio/${item.address}/work`).valueChanges().take(1).subscribe((work: any) => {
          if (JSON.stringify(work).toLowerCase().includes(this.query.toLowerCase())) {
            const index: number = findIndex(selectedProviders, { 'address': item.address });
            if (index === -1) {
              selectedProviders.push(item);
            }
          }
        });
      });

      for (let i = 0; i < selectedProviders.length; i++) {
        selectedProviders[i]['gradient'] = this.getRandomGradient(selectedProviders[i].colors);
      }

      this.filteredProviders = selectedProviders;
    } else {
      this.searching = false;
      this.filteredProviders = this.allProviders;
    }
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
