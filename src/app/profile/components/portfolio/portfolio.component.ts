import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFirestore } from 'angularfire2/firestore';
import { Subscription } from 'rxjs/Subscription';

import { User } from '../../../core-classes/user';
import { AnimationService } from '../../../core-services/animation.service';

@Component({
  selector: 'app-profile-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['../../profile.component.css']
})
export class PortfolioComponent implements OnInit, OnDestroy {

  @Input() userModel: User;
  @Input() currentUser: User;

  allPortfolioItems: any[] = [];
  loaded = false;

  pageLimit = 2;
  currentPage = 0;
  lastPage = 0;
  animation = 'fadeIn';

  portfolioSubscription: Subscription;


  constructor(private afs: AngularFirestore, private router: Router, private animationService: AnimationService) { }

  ngOnInit() {
    this.setPortfolio(this.userModel.address);
  }

  ngOnDestroy() {
    if (this.portfolioSubscription) { this.portfolioSubscription.unsubscribe(); }
  }

  setPortfolio(address: string) {
    const portfolioRecords = this.afs.collection(`portfolio/${address}/work`, ref => ref.orderBy('timestamp', 'desc'));
    this.portfolioSubscription = portfolioRecords.valueChanges().subscribe((data: any) => {
      this.allPortfolioItems = data;
      this.lastPage = (Math.ceil(this.allPortfolioItems.length / this.pageLimit) - 1);
      this.animationService.loadAnimations();
      this.loaded = true;
    });
  }

  paginatedPortfolioItems() {
    return this.allPortfolioItems.slice((this.currentPage * this.pageLimit), ((this.currentPage * this.pageLimit) + this.pageLimit));
  }

  nextPage() {
    this.animation = 'fadeOut';
    setTimeout(() => {
      this.currentPage++;
      this.animation = 'fadeIn';
    }, 300);
  }

  previousPage() {
    this.animation = 'fadeOut';
    setTimeout(() => {
      this.currentPage--;
      this.animation = 'fadeIn';
    }, 300);
  }

  onBuyCan() {
    this.router.navigate(['/exchange']);
  }

  postRequest() {
    this.router.navigate(['inbox/post', this.userModel.address]);
  }

  isMyProfile() {
    return (this.userModel && (this.userModel.address === this.currentUser.address));
  }

  notMyProfile() {
    return (this.userModel && (this.userModel.address !== this.currentUser.address));
  }
}
