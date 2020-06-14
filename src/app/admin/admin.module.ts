import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { AdminRoutingModule } from './admin.routing.module'

@NgModule({
  imports: [
    CommonModule,
    AdminRoutingModule,
  ],
  declarations: [
  ],
  exports: [AdminRoutingModule],
})  
export class AdminModule {}
