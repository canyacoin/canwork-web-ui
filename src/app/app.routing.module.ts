import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublicJobComponent } from './public-job/public-job/public-job.component';
import { JobBidsComponent } from './public-job/job-bids/job-bids.component';
import { LandingComponent } from './landing/landing.component';
import { BrandComponent } from './core-components/brand/brand.component';
import { FaqPageComponent } from './core-components/faq-page/faq-page.component';
import { ComingSoonComponent } from './core-components/coming-soon/coming-soon.component';
import { ToolsComponent } from './core-components/tools/tools.component';
import { DashboardComponent } from './public-job/dashboard/dashboard.component';
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
        path: 'home',
        loadChildren: './home/home.module#HomeModule'
      },
      {
        path: 'search',
        loadChildren: './search/search.module#SearchModule'
      },
      {
        path: 'jobs',
        component: DashboardComponent
      },
      {
        path: 'jobs/:jobId',
        component: PublicJobComponent
      },
      {
        path: 'jobs/public/:slug',
        component: PublicJobComponent
      },
      {
        path: 'jobs/:jobId/bids',
        component: JobBidsComponent
      },
      {
        path: 'jobs/public/:slug/bids',
        component: JobBidsComponent
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

