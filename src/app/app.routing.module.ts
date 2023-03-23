import { from } from 'rxjs'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { PublicJobComponent } from './public-job/public-job/public-job.component'
import { JobBidsComponent } from './public-job/job-bids/job-bids.component'
import { LandingComponent } from './landing/landing.component'
import { BrandComponent } from './core-components/brand/brand.component'
import { FaqPageComponent } from './core-components/faq-page/faq-page.component'
import { DashboardComponent } from './public-job/dashboard/dashboard.component'
import { AuthGuard } from './core-utils/auth.guard'
import { UserIsSetupGuard } from './core-utils/user-is-setup.guard'
import { WalletBnbComponent } from './wallet-bnb/wallet-bnb.component'
import { WalletBnbAssetsComponent } from './wallet-bnb-assets/wallet-bnb-assets.component'

@NgModule({
  imports: [
    RouterModule.forRoot(
      [
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
          loadChildren: () =>
            import('./auth/auth.module').then((m) => m.AuthModule),
          canActivate: [AuthGuard],
          data: { requiresLoggedOut: true },
        },
        {
          path: 'home',
          loadChildren: () =>
            import('./home/home.module').then((m) => m.HomeModule),
        },
        {
          path: 'search',
          loadChildren: () =>
            import('./search/search.module').then((m) => m.SearchModule),
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
          loadChildren: () =>
            import('./profile/profile.module').then((m) => m.ProfileModule),
        },
        {
          path: 'inbox',
          loadChildren: () =>
            import('./inbox/inbox.module').then((m) => m.InboxModule),
          canActivate: [AuthGuard, UserIsSetupGuard],
          data: { requiresLoggedIn: true },
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
          loadChildren: () =>
            import('./error/error.module').then((m) => m.ErrorModule),
        },
      ],
      { relativeLinkResolution: 'legacy' }
    ),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
