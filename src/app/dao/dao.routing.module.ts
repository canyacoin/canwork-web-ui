import { DAODashComponent } from './dao-dash.component'
import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

const routes: Routes = [
  {
    path: '',
    component: DAODashComponent,
  },
  {
    path: 'DAO-Dash',
    component: DAODashComponent,
  },
]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DAORoutingModule {}
