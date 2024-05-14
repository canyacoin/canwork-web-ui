import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { CoreComponentsModule } from '../../core-components/core-components.module'
import { CoreServicesModule } from '../../core-services/core-services.module'
import { DashboardComponent } from './dashboard.component'
import { HeroComponent } from './hero/hero.component'
import { FilterComponent } from './filter/filter.component'
import { ResultComponent } from './result/result.component'
import { PaginatorModule } from 'primeng/paginator'
import { AccordionModule } from 'primeng/accordion'
import { CheckboxModule } from 'primeng/checkbox'
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { DashboardRoutingModule } from './dashboard.routing.module'

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
    DropdownModule,
    FormsModule
  ],
  declarations: [
    DashboardComponent,
    HeroComponent,
    FilterComponent,
    ResultComponent,
  ],
  exports: [DashboardRoutingModule],
})
export class DashboardModule {}
