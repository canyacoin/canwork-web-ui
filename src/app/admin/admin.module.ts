import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { CoreComponentsModule } from '../core-components/core-components.module'
import { AdminRoutingModule } from './admin.routing.module'
import { DashboardComponent } from './dashboard/dashboard.component'

@NgModule({
  imports: [
    CommonModule,
    CoreComponentsModule,    
    AdminRoutingModule,
  ],
  declarations: [
    DashboardComponent,
  ],
  exports: [AdminRoutingModule],
})  
export class AdminModule {}
