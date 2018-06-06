import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { ToolsComponent } from './core-components/tools/tools.component';
import { ConsoleComponent } from './core-components/console/console.component';

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
        path: 'auth',
        loadChildren: './auth/auth.module#AuthModule'
      },
      {
        path: 'tools',
        component: ToolsComponent
      },
      {
        path: 'brnad',
        component: BrandComponent
      },
      {
        path: 'console',
        component: ConsoleComponent
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

