import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { DashboardComponent } from './dashboard/dashboard.component'
import { AuthGuard } from '../core-utils/auth.guard'



const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}