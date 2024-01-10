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

@NgModule({
  imports: [
    CommonModule,
    CoreComponentsModule,
    CoreServicesModule,
    //NgAisModule,
    RouterModule,
    NgxSliderModule,
  ],
  declarations: [SearchComponent],
  exports: [SearchRoutingModule],
})
export class SearchModule {}
