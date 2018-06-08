import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserIsNotSetupGuard } from '../core-utils/user-is-not-setup.guard';
import { UserIsSetupGuard } from '../core-utils/user-is-setup.guard';
import { EditComponent } from './edit/edit.component';
import { ProfileViewsComponent } from './profile-views/profile-views.component';
import { ProfileComponent } from './profile.component';
import { SetupComponent } from './setup/setup.component';

const routes: Routes = [
  {
    path: '',
    component: ProfileComponent,
    canActivate: [UserIsSetupGuard]
  },
  {
    path: 'setup',
    component: SetupComponent,
    canActivate: [UserIsNotSetupGuard]
  },
  {
    path: 'edit',
    component: EditComponent,
    canActivate: [UserIsSetupGuard]
  },
  {
    path: 'views',
    component: ProfileViewsComponent,
    canActivate: [UserIsSetupGuard]
  },
  {
    path: 'alt/:address',
    component: ProfileComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }
