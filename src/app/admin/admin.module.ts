import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { AdminRoutingModule } from './admin-routing.module'
import { DashboardComponent } from './dashboard/dashboard.component'
import { CoreComponentsModule } from '../core-components/core-components.module'

@NgModule({
  declarations: [DashboardComponent],
  imports: [CommonModule, AdminRoutingModule, CoreComponentsModule],
})
export class AdminModule {}
