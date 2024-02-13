import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
// import { NgAisModule } from 'angular-instantsearch'
import { RouterModule } from '@angular/router'
import { CoreComponentsModule } from '../core-components/core-components.module'
import { CoreServicesModule } from '../core-services/core-services.module'
import { SearchComponent } from './search.component'
import { SearchRoutingModule } from './search.routing.module'
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
    // NgAisModule,
    RouterModule,
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
