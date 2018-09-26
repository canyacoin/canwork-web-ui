import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AnimationService } from '../../core-services/animation.service';

import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-random-animation',
  templateUrl: './random-animation.component.html',
  styleUrls: ['./random-animation.component.css']
})
export class RandomAnimationComponent implements AfterViewInit, OnDestroy {

  randomAnimation = 0;
  routeSub: Subscription;

  constructor(private activatedRoute: ActivatedRoute, private animationService: AnimationService) { }

  ngAfterViewInit() {
    this.routeSub = this.activatedRoute.url.subscribe((url) => {
      this.animationService.loadAnimations();
    });
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    this.animationService.resetAnimations();
  }

}
