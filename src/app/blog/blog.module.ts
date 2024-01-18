import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
// import { NgAisModule } from 'angular-instantsearch'
import { RouterModule } from '@angular/router'
import { CoreComponentsModule } from '../core-components/core-components.module'
import { CoreServicesModule } from '../core-services/core-services.module'
import { BlogComponent } from './blog.component'
import { BlogRoutingModule } from './blog.routing.module'
import { HeroComponent } from './hero/hero.component'
import { ResultComponent } from './result/result.component'
import { PaginatorModule } from 'primeng/paginator'
import { FormsModule } from '@angular/forms'

@NgModule({
  imports: [
    CommonModule,
    CoreComponentsModule,
    CoreServicesModule,
    // NgAisModule,
    RouterModule,
    PaginatorModule,
    FormsModule,
  ],
  declarations: [BlogComponent, HeroComponent, ResultComponent],
  exports: [BlogRoutingModule],
})
export class BlogModule {}
