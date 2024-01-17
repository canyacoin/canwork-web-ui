import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
// import { NgAisModule } from 'angular-instantsearch'

import { CoreComponentsModule } from '../core-components/core-components.module'
import { CoreServicesModule } from '../core-services/core-services.module'

import { FaqsComponent } from './faqs.component'
import { FaqsRoutingModule } from './faqs.routing.module'
import { HeroComponent } from './hero/hero.component'
import { ResultComponent } from './result/result.component'
import { CarouselModule } from 'primeng/carousel'
import { AccordionModule } from 'primeng/accordion'

@NgModule({
  imports: [
    CommonModule,
    CoreComponentsModule,
    CoreServicesModule,
    FaqsRoutingModule,
    // NgAisModule,
    CarouselModule,
    AccordionModule,
  ],
  declarations: [FaqsComponent, HeroComponent, ResultComponent],
  exports: [FaqsRoutingModule],
})
export class FaqsModule {}
