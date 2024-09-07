import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { BlogComponent } from './blog.component'
import { PublicBlogComponent } from './public-blog/public-blog.component'

const routes: Routes = [
  {
    path: '',
    component: BlogComponent,
  },
  {
    path: ':slug',
    component: PublicBlogComponent,
  },
]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BlogRoutingModule {}
