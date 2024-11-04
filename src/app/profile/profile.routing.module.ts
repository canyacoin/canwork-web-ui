import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { AuthGuard } from '../core-utils/auth.guard'
import { UserIsNotSetupGuard } from '../core-utils/user-is-not-setup.guard'
import { UserIsSetupGuard } from '../core-utils/user-is-setup.guard'
// import { ProfileViewsComponent } from './profile-views/profile-views.component'
import { ProfileComponent } from './profile.component'
import { ProjectComponent } from './project/project.component'
import { SetupComponent } from './setup/setup.component'

const routes: Routes = [
  {
    path: '',
    component: ProfileComponent,
    canActivate: [UserIsSetupGuard],
  },
  {
    path: 'setup',
    component: SetupComponent,
    canActivate: [AuthGuard, UserIsNotSetupGuard],
    data: { requiresLoggedIn: true },
  },
  {
    path: 'project',
    component: ProjectComponent,
    canActivate: [AuthGuard, UserIsSetupGuard],
    data: { requiresLoggedIn: true },
  },
  {
    path: 'project/:id',
    component: ProjectComponent,
    canActivate: [AuthGuard, UserIsSetupGuard],
    data: { requiresLoggedIn: true },
  },
  // {
  //   path: 'views',
  //   component: ProfileViewsComponent,
  //   canActivate: [AuthGuard, UserIsSetupGuard],
  //   data: { requiresLoggedIn: true },
  // },
  {
    path: 'alt/:address',
    component: ProfileComponent,
  },
  {
    path: ':slug',
    component: ProfileComponent,
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfileRoutingModule {}
