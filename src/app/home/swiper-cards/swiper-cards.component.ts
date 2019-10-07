import { Component, AfterViewInit, OnDestroy } from '@angular/core'
import { ActivatedRoute } from '@angular/router'

import { Subscription } from 'rxjs'

@Component({
  selector: 'app-swiper-cards',
  templateUrl: './swiper-cards.component.html',
  styleUrls: ['./swiper-cards.component.css'],
})
export class SwiperCardsComponent implements AfterViewInit, OnDestroy {
  routeSub: Subscription

  constructor(private activatedRoute: ActivatedRoute) {}

  ngAfterViewInit() {
    this.routeSub = this.activatedRoute.url.subscribe(url => {
      this.loadSlides()
    })
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe()
    }
  }

  loadSlides() {
    const options = {
      autoplay: 3000,
      speed: 1000,
      loop: true,
      breakpoints: {
        480: {
          slidesPerView: 1,
        },
      },
    }
    if ((<any>window).Swiper) {
      const slides = new (<any>window).Swiper('.swiper-container', options)
    }
  }
}
