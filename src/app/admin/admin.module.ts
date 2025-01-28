import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { AdminRoutingModule } from './admin-routing.module'
import { DashboardComponent } from './dashboard/dashboard.component'
import { CoreComponentsModule } from '../core-components/core-components.module'
import { EditArticleComponent } from './edit-article/edit-article.component'

@NgModule({
  declarations: [DashboardComponent, EditArticleComponent],
  imports: [
    CommonModule,
    FormsModule,
    AdminRoutingModule,
    CoreComponentsModule,
  ],
})
export class AdminModule {}
