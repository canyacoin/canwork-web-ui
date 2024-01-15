import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { FaqsComponent } from './faqs.component'

const routes: Routes = [
  {
    path: '',
    component: FaqsComponent,
  },
]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FaqsRoutingModule {}
