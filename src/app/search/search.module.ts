import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
//import { NgAisModule } from 'angular-instantsearch'
import { RouterModule } from '@angular/router'
import { CoreComponentsModule } from '../core-components/core-components.module'
import { CoreServicesModule } from '../core-services/core-services.module'
import { SearchComponent } from './search.component'
import { SearchRoutingModule } from './search.routing.module'
//import { Ng5SliderModule } from 'ng5-slider' // deprecated
import { NgxSliderModule } from 'ngx-slider-v2'
import { NgArrayPipesModule } from 'ngx-pipes' // https://www.npmjs.com/package/ngx-pipes#array
import { HeroComponent } from './hero/hero.component'
import { FilterComponent } from './filter/filter.component'
import { ResultComponent } from './result/result.component'
import { PaginatorModule } from 'primeng/paginator'
import { AccordionModule } from 'primeng/accordion'
import { CheckboxModule } from 'primeng/checkbox'

@NgModule({
  imports: [
    CommonModule,
    CoreComponentsModule,
    CoreServicesModule,
    //NgAisModule,
    RouterModule,
    NgxSliderModule,
    NgArrayPipesModule,
    PaginatorModule,
    AccordionModule,
    CheckboxModule,
  ],
  declarations: [
    SearchComponent,
    HeroComponent,
    FilterComponent,
    ResultComponent,
  ],
  exports: [SearchRoutingModule],
})
export class SearchModule {}
