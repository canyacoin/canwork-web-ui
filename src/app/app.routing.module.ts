import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { BrandComponent } from './core-components/brand/brand.component';
import { ToolsComponent } from './core-components/tools/tools.component';
import { ConsoleComponent } from './core-components/console/console.component';

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
        path: 'login',
        redirectTo: '/auth',
        pathMatch: 'full'
      },
      {
        path: 'auth',
        loadChildren: './auth/auth.module#AuthModule',
        canActivate: [AuthGuard],
        data: { requiresLoggedOut: true}
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
        data: { requiresLoggedIn: true}
      },
      {
        path: '**',
        loadChildren: './error/error.module#ErrorModule'
      }
    ])
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }

