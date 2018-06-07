import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BrandComponent } from './core-components/brand/brand.component';
import { ConsoleComponent } from './core-components/console/console.component';
import { ToolsComponent } from './core-components/tools/tools.component';
import { AuthGuard } from './core-utils/auth.guard';

@NgModule({
  imports: [
    RouterModule.forRoot([
      {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadChildren: './home/home.module#HomeModule'
      },
      {
        path: 'profile',
        loadChildren: './profile/profile.module#ProfileModule'
      },
      {
        path: 'login',
        redirectTo: '/auth',
        pathMatch: 'full'
      },
      {
        path: 'auth',
        loadChildren: './auth/auth.module#AuthModule',
        canActivate: [AuthGuard],
        data: { requiresLoggedOut: true }
      },
      {
        path: 'tools',
        component: ToolsComponent
      },
      {
        path: 'brand',
        component: BrandComponent
      },
      {
        path: 'console',
        component: ConsoleComponent,
        canActivate: [AuthGuard],
        data: { requiresLoggedIn: true }
      },
      {
        path: '**',
        loadChildren: './error/error.module#ErrorModule'
      }
    ], { onSameUrlNavigation: 'reload' })
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }

