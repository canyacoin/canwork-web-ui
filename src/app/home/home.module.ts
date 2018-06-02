import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ImgFallbackModule } from 'ngx-img-fallback';

import { CoreComponentsModule } from '../core-components/core-components.module';
import { CoreServicesModule } from '../core-services/core-services.module';

import { BlogPostsComponent } from './blog-posts/blog-posts.component';
import { HomeComponent } from './home.component';
import { RandomAnimationComponent } from './random-animation/random-animation.component';
import { SwiperCardsComponent } from './swiper-cards/swiper-cards.component';

@NgModule({
  imports: [
    RouterModule.forRoot([
      { path: 'home', component: HomeComponent },
      { path: 'search/:query', component: HomeComponent }
    ]),
    CommonModule,
    CoreComponentsModule,
    CoreServicesModule,
    ImgFallbackModule
  ],
  declarations: [
    BlogPostsComponent,
    HomeComponent,
    RandomAnimationComponent,
    SwiperCardsComponent
  ]
})
export class HomeModule { }
