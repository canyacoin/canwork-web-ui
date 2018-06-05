import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

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

