import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LandingComponent } from './landing/landing.component';
import { BrandComponent } from './core-components/brand/brand.component';
import { FaqPageComponent } from './core-components/faq-page/faq-page.component';
import { ToolsComponent } from './core-components/tools/tools.component';
import { AuthGuard } from './core-utils/auth.guard';
import { UserIsSetupGuard } from './core-utils/user-is-setup.guard';

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
        component: LandingComponent
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
        path: 'exchange',
        loadChildren: './exchange/exchange.module#ExchangeModule'
      },
      {
        path: 'search',
        loadChildren: './search/search.module#SearchModule'
      },
      {
        path: 'profile',
        loadChildren: './profile/profile.module#ProfileModule'
      },
      {
        path: 'inbox',
        loadChildren: './inbox/inbox.module#InboxModule',
        canActivate: [AuthGuard, UserIsSetupGuard],
        data: { requiresLoggedIn: true }
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
        path: 'faq',
        component: FaqPageComponent
      },
      {
        path: 'landing',
        component: LandingComponent
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

