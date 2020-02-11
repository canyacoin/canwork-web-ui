import { Http, HttpModule } from '@angular/http'
import { DAORoutingModule } from './dao.routing.module'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DAODashComponent } from './dao-dash.component'

@NgModule({
  declarations: [DAODashComponent],
  imports: [CommonModule, HttpModule],
  exports: [DAORoutingModule],
})
export class DAOModule {}
