import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { DashboardComponent } from './dashboard/dashboard.component'
import { EditArticleComponent } from './edit-article/edit-article.component'

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
  },
  {
    path: 'edit',
    component: EditArticleComponent,
  }, // create
  {
    path: 'edit/:slug',
    component: EditArticleComponent,
  }, // edit
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
