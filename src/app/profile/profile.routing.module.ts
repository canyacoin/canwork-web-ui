import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserIsSetupGuard } from '../core-utils/user-is-setup.guard';
import { ProfileComponent } from './profile.component';

const routes: Routes = [
  {
    path: '',
    component: ProfileComponent,
    canActivate: [UserIsSetupGuard]
  },
  // {
  //   path: 'profile/edit',
  //   component: EditComponent,
  //   canActivate: [AuthGuard]
  // },
  {
    path: 'profile/:address',
    component: ProfileComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }
