import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { NgAisModule } from 'angular-instantsearch'

import { CoreComponentsModule } from '../core-components/core-components.module'
import { CoreServicesModule } from '../core-services/core-services.module'
import { HomeComponent } from './home.component'
import { HomeRoutingModule } from './home.routing.module'
import { SwiperCardsComponent } from './swiper-cards/swiper-cards.component'

@NgModule({
  imports: [
    CommonModule,
    CoreComponentsModule,
    CoreServicesModule,
    HomeRoutingModule,
    NgAisModule,
  ],
  declarations: [HomeComponent, SwiperCardsComponent],
  exports: [HomeRoutingModule],
})
export class HomeModule {}
