import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { PublicJobComponent } from './public-job/public-job/public-job.component'
import { JobBidsComponent } from './public-job/job-bids/job-bids.component'
import { LandingComponent } from './landing/landing.component'
import { BrandComponent } from './core-components/brand/brand.component'
import { FaqPageComponent } from './core-components/faq-page/faq-page.component'
import { ToolsComponent } from './core-components/tools/tools.component'
import { DashboardComponent } from './public-job/dashboard/dashboard.component'
import { AuthGuard } from './core-utils/auth.guard'
import { UserIsSetupGuard } from './core-utils/user-is-setup.guard'
import { WalletBnbComponent } from './wallet-bnb/wallet-bnb.component'
import { WalletBnbAssetsComponent } from './wallet-bnb-assets/wallet-bnb-assets.component'

@NgModule({
  imports: [
    RouterModule.forRoot([
      {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full',
      },
      {
        path: 'login',
        redirectTo: '/auth',
        pathMatch: 'full',
      },
      {
        path: 'auth',
        loadChildren: './auth/auth.module#AuthModule',
        canActivate: [AuthGuard],
        data: { requiresLoggedOut: true },
      },
      {
        path: 'home',
        loadChildren: './home/home.module#HomeModule',
      },
      {
        path: 'search',
        loadChildren: './search/search.module#SearchModule',
      },
      {
        path: 'jobs',
        component: DashboardComponent,
      },
      {
        path: 'jobs/:jobId',
        component: PublicJobComponent,
      },
      {
        path: 'jobs/public/:slug',
        component: PublicJobComponent,
      },
      {
        path: 'jobs/:jobId/bids',
        component: JobBidsComponent,
      },
      {
        path: 'jobs/public/:slug/bids',
        component: JobBidsComponent,
      },
      {
        path: 'profile',
        loadChildren: './profile/profile.module#ProfileModule',
      },
      {
        path: 'inbox',
        loadChildren: './inbox/inbox.module#InboxModule',
        canActivate: [AuthGuard, UserIsSetupGuard],
        data: { requiresLoggedIn: true },
      },
      {
        path: 'tools',
        component: ToolsComponent,
      },
      {
        path: 'brand',
        component: BrandComponent,
      },
      {
        path: 'faq',
        component: FaqPageComponent,
      },
      {
        path: 'landing',
        component: LandingComponent,
      },
      {
        path: 'wallet-bnb',
        component: WalletBnbComponent,
        pathMatch: 'full',
      },
      {
        path: 'wallet-bnb/assets',
        component: WalletBnbAssetsComponent,
        pathMatch: 'full',
      },
      {
        path: '**',
        loadChildren: './error/error.module#ErrorModule',
      },
    ]),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
